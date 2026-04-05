/**
 * MongoDB/Mongoose configuration
 */

import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/regalem';
    
    await mongoose.connect(mongoUri, {
      // Removed deprecated options - they're no longer needed in Mongoose 6+
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoUri}`);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ Disconnect error:', error.message);
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
};