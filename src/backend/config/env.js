/**
 * Environment configuration
 */

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/regalem',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  INACTIVITY_TIMEOUT: parseInt(process.env.INACTIVITY_TIMEOUT || '180000'), // 3 minutes
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};