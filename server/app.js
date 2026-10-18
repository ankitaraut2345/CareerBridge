const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const alumniRoutes = require('./routes/alumni.routes');
const adminRoutes = require('./routes/admin.routes');
const opportunityRoutes = require('./routes/opportunity.routes');
const applicationRoutes = require('./routes/application.routes');
const studentRoutes = require('./routes/student.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');
const referralRoutes = require('./routes/referral.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const aiRoutes = require('./routes/ai.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const { authLimiter, aiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security Headers Middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ── CORS Configuration ───────────────────────────────────────────────────────
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/+$/, '') : null;
const vercelEnvUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim().replace(/\/+$/, '')}` : null;

const allowedOrigins = [
  clientUrl,
  vercelEnvUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

// Legitimate Vercel preview domain pattern: https://<subdomain>.vercel.app
const isLegitimateVercelOrigin = (origin) => {
  return /^https:\/\/[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.vercel\.app$/.test(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, internal tests), dev environments, exact allowed origins, or verified Vercel preview domains
    if (
      !origin ||
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      isLegitimateVercelOrigin(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Body Parser with Explicit Limits ─────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── API Routes with Rate Limiting ────────────────────────────────────────────
app.use('/api', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
