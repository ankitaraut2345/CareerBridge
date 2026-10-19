const mongoose = require('mongoose');
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';

  if (!uri) {
    const errorMsg = '❌ MongoDB Connection Error: MONGODB_URI is not defined in environment variables.';
    console.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    }
    return null;
  }

  if (cached.conn || mongoose.connection.readyState === 1) {
    return cached.conn || mongoose.connection;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected successfully: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error('❌ MongoDB Connection Failed:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    if (isProduction) {
      throw error;
    }
    console.warn('⚠️  CareerBridge API will continue running in development, but database features will be unavailable until MongoDB is connected.');
    return null;
  }
};

module.exports = connectDB;
