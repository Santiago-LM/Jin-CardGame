/**
 * Regalem GYN Server Entry Point
 */

import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDatabase } from './src/backend/config/database.js';
import { User } from './src/backend/models/User.js';
import { errorHandler } from './src/backend/middleware/errorHandler.js';
import { socketManager } from './src/backend/websocket/socketManager.js';
import authRoutes from './src/backend/api/auth.routes.js';
import roomsRoutes from './src/backend/api/rooms.routes.js';
import gamesRoutes from './src/backend/api/games.routes.js';
import leaderboardRoutes from './src/backend/api/leaderboard.routes.js';
import profileRoutes from './src/backend/api/profile.routes.js';
import { FRONTEND_URL, PORT } from './src/backend/config/env.js';

// Initialize environment variables
dotenv.config();

// Get __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app and server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

// Custom helmet configuration with relaxed CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.socket.io'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'http://localhost:3000',
          'ws://localhost:3000',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ],
        imgSrc: ["'self'", 'data:'],
        frameSrc: ["'none'"],
      },
    },
  })
);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend source files
app.use('/src/frontend', express.static(path.join(__dirname, 'src/frontend')));
app.use('/src/shared', express.static(path.join(__dirname, 'src/shared')));

// Database connection
connectDatabase();

// Fix database indexes on startup
async function fixIndexes() {
  try {
    console.log('🔧 Fixing database indexes...');

    // Drop old indexes
    await User.collection.dropIndexes();
    console.log('✓ Old indexes dropped');

    // Create new indexes
    await User.collection.createIndexes();
    console.log('✓ New indexes created');
  } catch (error) {
    if (error.message.includes('no indexes to drop')) {
      console.log('✓ No old indexes to drop');
    } else {
      console.error('Index error:', error.message);
    }
  }
}

fixIndexes();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/game.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// WebSocket
socketManager(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🎴 Regalem Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Frontend URL: ${FRONTEND_URL}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

export { app, server, io };