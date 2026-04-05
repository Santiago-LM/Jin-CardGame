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
import { errorHandler } from './src/backend/middleware/errorHandler.js';
import { socketManager } from './src/backend/websocket/socketManager.js';
import authRoutes from './src/backend/api/auth.routes.js';
import roomsRoutes from './src/backend/api/rooms.routes.js';
import gamesRoutes from './src/backend/api/games.routes.js';
import leaderboardRoutes from './src/backend/api/leaderboard.routes.js';
import profileRoutes from './src/backend/api/profile.routes.js';

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
connectDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);

// WebSocket
socketManager(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, io };