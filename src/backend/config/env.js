/**
 * Environment configuration
 */

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/regalem';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const INACTIVITY_TIMEOUT = parseInt(process.env.INACTIVITY_TIMEOUT || '180000'); // 3 minutes
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Development mode check
 */
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';

/**
 * Log configuration
 */
export const logConfig = {
  level: LOG_LEVEL,
  format: isDevelopment ? 'dev' : 'combined',
};

/**
 * Database configuration
 */
export const dbConfig = {
  uri: MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  },
};

/**
 * JWT configuration
 */
export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256',
};

/**
 * Server configuration
 */
export const serverConfig = {
  port: PORT,
  host: 'localhost',
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
};

/**
 * Default export object (for compatibility)
 */
export default {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  FRONTEND_URL,
  INACTIVITY_TIMEOUT,
  LOG_LEVEL,
  isDevelopment,
  isProduction,
  logConfig,
  dbConfig,
  jwtConfig,
  serverConfig,
};