process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection in Serverless Container:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception in Serverless Container:', err);
});

const app = require('../server/app');

/**
 * CareerBridge Vercel Serverless Function Handler
 * Explicit (req, res) handler function for native Vercel @vercel/node runtime.
 */
module.exports = (req, res) => {
  return app(req, res);
};

