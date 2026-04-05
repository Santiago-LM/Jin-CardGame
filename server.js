/**
 * Regalem GYN Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { connectDatabase } = require('./src/backend/config/database');
const { errorHandler } = require('./src/backend/middleware/errorHandler');
const { socketManager } = require('./src/backend/websocket/socketManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
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
app.use('/api/auth', require('./src/backend/api/auth.routes'));
app.use('/api/rooms', require('./src/backend/api/rooms.routes'));
app.use('/api/games', require('./src/backend/api/games.routes'));
app.use('/api/leaderboard', require('./src/backend/api/leaderboard.routes'));
app.use('/api/profile', require('./src/backend/api/profile.routes'));

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

module.exports = { app, server, io };