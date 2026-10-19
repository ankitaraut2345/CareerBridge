process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection in Serverless Container:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception in Serverless Container:', err);
});

// Polyfill browser globals required by PDF/Canvas dependencies in serverless Node.js
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {};
}
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {};
}

const app = require('../server/app');

/**
 * CareerBridge Vercel Serverless Function Handler
 * Explicit (req, res) handler function for native Vercel @vercel/node runtime.
 */
module.exports = (req, res) => {
  return app(req, res);
};

