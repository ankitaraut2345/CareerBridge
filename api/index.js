const app = require('../server/app');

/**
 * CareerBridge Vercel Serverless Function Handler
 * Directly exports Express app instance for native Vercel @vercel/node runtime.
 */
module.exports = app;
