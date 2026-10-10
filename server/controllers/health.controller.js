const mongoose = require('mongoose');

// Health check controller
const getHealthStatus = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, database connection is required for healthy status
  if (isProduction && !isDbConnected) {
    return res.status(503).json({
      success: false,
      status: 'degraded',
      database: 'disconnected',
      message: 'CareerBridge API database service unavailable',
    });
  }

  res.status(200).json({
    success: true,
    status: 'healthy',
    database: isDbConnected ? 'connected' : 'in-memory-fallback',
    message: 'CareerBridge API is running',
  });
};

module.exports = {
  getHealthStatus,
};
