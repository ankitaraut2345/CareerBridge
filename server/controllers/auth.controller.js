const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const {
  findUserByEmailWithPassword,
  userExists,
  createUser,
} = require('../services/userStore.service');

// Valid email regex pattern
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Register a new user (Student or Alumni)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate presence of required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and role.',
      });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedRole = role.toUpperCase();

    // Security Gate: Restrict public registration to STUDENT and ALUMNI only
    if (['TPO', 'ADMIN'].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message:
          'TPO and Admin accounts cannot be created via public registration. Please contact your institution administrator.',
      });
    }

    if (!['STUDENT', 'ALUMNI'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Public registration permits STUDENT or ALUMNI only.',
      });
    }

    // Check duplicate email
    const exists = await userExists(email);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Alumni accounts require verification (PENDING), Students are auto-VERIFIED
    const verificationStatus = normalizedRole === 'ALUMNI' ? 'PENDING' : 'VERIFIED';

    const newUser = await createUser({
      name: name.trim(),
      email,
      password,
      role: normalizedRole,
      verificationStatus,
    });

    // Generate JWT token
    const token = generateToken(newUser);

    const safeUser = {
      id: newUser._id ? newUser._id.toString() : newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      verificationStatus: newUser.verificationStatus,
    };

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Retrieve user including hashed password
    const user = await findUserByEmailWithPassword(email);

    if (!user) {
      // Do not reveal whether email or password was incorrect
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password via bcrypt
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check active status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Generate JWT
    const token = generateToken(user);

    const safeUser = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * Log out user (stateless JWT client-side eviction)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Role to demo account mapping
 * Predefined canonical demo accounts for development and evaluation.
 */
const DEMO_ROLE_EMAIL_MAP = {
  STUDENT: 'student@demo.com',
  ALUMNI: 'alumni@demo.com',
  TPO: 'tpo@demo.com',
  ADMIN: 'admin@demo.com',
};

/**
 * Check if demo login is enabled via environment variable
 */
const isDemoLoginEnabled = () => {
  return process.env.ENABLE_DEMO_LOGIN === 'true';
};

/**
 * Get Quick Login / Demo status
 * GET /api/auth/demo-login
 */
const getDemoLoginStatus = async (req, res) => {
  const enabled = isDemoLoginEnabled();
  res.status(200).json({
    success: true,
    enabled,
    roles: enabled ? Object.keys(DEMO_ROLE_EMAIL_MAP) : [],
  });
};

/**
 * Instant Login / Quick Access for demo evaluation
 * POST /api/auth/demo-login
 */
const demoLogin = async (req, res, next) => {
  try {
    // 1. Verify feature flag is explicitly enabled
    if (!isDemoLoginEnabled()) {
      return res.status(403).json({
        success: false,
        message: 'Quick Login is disabled. Please sign in with your email and password.',
      });
    }

    const { role } = req.body;
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role for Quick Login (STUDENT, ALUMNI, TPO, or ADMIN).',
      });
    }

    const normalizedRole = String(role).toUpperCase().trim();
    const targetEmail = DEMO_ROLE_EMAIL_MAP[normalizedRole];

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Quick Login is only available for STUDENT, ALUMNI, TPO, and ADMIN.',
      });
    }

    // 2. Resolve predefined demo user
    const user = await findUserByEmailWithPassword(targetEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo account for role ${normalizedRole} was not found. Please verify database seeding.`,
      });
    }

    // 3. Check account activation
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This demo account is deactivated. Please contact support.',
      });
    }

    // 4. Generate real, valid JWT token using existing auth infrastructure
    const token = generateToken(user);

    const safeUser = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
    };

    return res.status(200).json({
      success: true,
      message: `Quick Login successful as ${normalizedRole}.`,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  getDemoLoginStatus,
  demoLogin,
};
