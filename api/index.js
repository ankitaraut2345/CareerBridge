const app = require('../server/app');
const connectDB = require('../server/config/db');

/**
 * CareerBridge Vercel Serverless Function Handler
 * Wraps Express app and ensures database connection reuse across warm lambdas.
 */
module.exports = async (req, res) => {
  // Ensure database connection is initialized for serverless invocations
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err.message);
  }

  // Normalize request url if rewritten without /api prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
