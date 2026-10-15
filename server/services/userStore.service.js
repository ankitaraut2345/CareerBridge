const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { DEMO_USERS } = require('../config/demoAccounts');

// In-memory user cache used as resilient fallback when MongoDB is offline
const memoryUsers = [];

// Initialize demo users in memory
let memoryInitialized = false;
const initMemoryStore = () => {
  if (memoryInitialized) return;
  let sourceUsers = DEMO_USERS;
  try {
    const { USERS_SEED } = require('../seed/seedData');
    if (Array.isArray(USERS_SEED) && USERS_SEED.length > 0) {
      sourceUsers = USERS_SEED;
    }
  } catch (err) {
    sourceUsers = DEMO_USERS;
  }

  for (const demoUser of sourceUsers) {
    const hashedPassword = demoUser.password && demoUser.password.startsWith('$2')
      ? demoUser.password
      : bcrypt.hashSync(demoUser.password || 'demo123', 10);
    const emailPrefix = demoUser.email.toLowerCase().split('@')[0].replace('.', '_');
    const id = demoUser.key || (['student', 'alumni', 'tpo', 'admin'].includes(emailPrefix)
      ? 'demo_' + emailPrefix
      : emailPrefix);

    memoryUsers.push({
      _id: id,
      name: demoUser.name,
      email: demoUser.email.toLowerCase(),
      password: hashedPassword,
      role: demoUser.role,
      verificationStatus: demoUser.verificationStatus || 'VERIFIED',
      isActive: demoUser.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  memoryInitialized = true;
};
initMemoryStore();
console.log(`💾 Memory store initialized with ${memoryUsers.length} demo users`);


const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Seed demo users into MongoDB if connected and not yet seeded.
 * Strictly blocked in production environments to prevent automatic demo account creation.
 */
const seedDemoUsersIntoDb = async () => {
  const isProduction = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
  if (isProduction) {
    console.log('🔒 Production mode detected: Automatic demo user seeding is disabled.');
    return { skipped: true, reason: 'production' };
  }
  if (!isDbConnected()) return { skipped: true, reason: 'db_not_connected' };
  try {
    let seededCount = 0;
    for (const demoUser of DEMO_USERS) {
      const existing = await User.findOne({ email: demoUser.email.toLowerCase() });
      if (!existing) {
        await User.create(demoUser);
        seededCount++;
        console.log(`🌱 Seeded demo account: ${demoUser.email} (${demoUser.role})`);
      }
    }
    return { success: true, seededCount };
  } catch (err) {
    console.error('Error seeding demo accounts into MongoDB:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Find user by email (including password for comparison)
 */
const findUserByEmailWithPassword = async (email) => {
  const normalized = email.toLowerCase().trim();
  if (isDbConnected()) {
    return await User.findOne({ email: normalized }).select('+password');
  }
  // Debug: log memory fallback lookup
  console.log('🔍 Memory fallback lookup for email:', normalized);
  console.log('💾 Memory users count:', memoryUsers.length);
  return memoryUsers.find((u) => u.email === normalized) || null;
};

/**
 * Find user by ID (safe, without password)
 */
const findUserById = async (id) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    return await User.findById(id);
  }
  const mem = memoryUsers.find((u) => (u._id ? u._id.toString() : u.id) === id);
  if (!mem) return null;
  const safe = { ...mem };
  delete safe.password;
  return safe;
};

/**
 * Check if user exists by email
 */
const userExists = async (email) => {
  const normalized = email.toLowerCase().trim();
  if (isDbConnected()) {
    const count = await User.countDocuments({ email: normalized });
    return count > 0;
  }
  return memoryUsers.some((u) => u.email === normalized);
};

/**
 * Create a new user
 */
const createUser = async ({ name, email, password, role, verificationStatus }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isDbConnected()) {
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      verificationStatus,
    });
    return newUser;
  }

  // Fallback memory creation
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = {
    _id: 'user_' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    verificationStatus:
      verificationStatus || (role === 'ALUMNI' ? 'PENDING' : 'VERIFIED'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryUsers.push(user);
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
};

module.exports = {
  isDbConnected,
  seedDemoUsersIntoDb,
  findUserByEmailWithPassword,
  findUserById,
  userExists,
  createUser,
  memoryUsers,
};
