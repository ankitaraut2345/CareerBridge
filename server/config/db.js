const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';

  if (!uri) {
    const errorMsg = '❌ MongoDB Connection Error: MONGODB_URI is not defined in environment variables.';
    console.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    if (isProduction) {
      throw error;
    }
    console.warn('⚠️  CareerBridge API will continue running in development, but database features will be unavailable until MongoDB is connected.');
  }
};

module.exports = connectDB;
