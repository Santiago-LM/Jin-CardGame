/**
 * Socket.io setup and connection handling
 */

const { RoomService } = require('../services/roomService');
const gameHandlers = require('./handlers/gameHandlers');
const moveHandlers = require('./handlers/moveHandlers');
const playerHandlers = require('./handlers/playerHandlers');
const spectatorHandlers = require('./handlers/spectatorHandlers');

const roomService = new RoomService();

const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Attach room service to socket
    socket.roomService = roomService;
    socket.io = io;

    // Game lifecycle events
    socket.on('joinGame', (data) => gameHandlers.handleJoinGame(socket, data));
    socket.on('leaveGame', (data) => gameHandlers.handleLeaveGame(socket, data));
    socket.on('startGame', (data) => gameHandlers.handleStartGame(socket, data));
    socket.on('getGameState', (callback) => gameHandlers.handleGetGameState(socket, callback));

    // Move events
    socket.on('playMove', (data, callback) => moveHandlers.handlePlayMove(socket, data, callback));
    socket.on('drawFromDeck', (callback) => moveHandlers.handleDrawFromDeck(socket, callback));
    socket.on('drawFromPile', (data, callback) => moveHandlers.handleDrawFromPile(socket, data, callback));
    socket.on('stealFromPile', (data, callback) => moveHandlers.handleStealFromPile(socket, data, callback));
    socket.on('playSets', (data, callback) => moveHandlers.handlePlaySets(socket, data, callback));
    socket.on('playJIN', (data, callback) => moveHandlers.handlePlayJIN(socket, data, callback));
    socket.on('discardCards', (data, callback) => moveHandlers.handleDiscard(socket, data, callback));

    // Player events
    socket.on('disconnect', () => playerHandlers.handleDisconnect(socket));
    socket.on('reconnect', () => playerHandlers.handleReconnect(socket));

    // Spectator events
    socket.on('joinAsSpectator', (data) => spectatorHandlers.handleJoinSpectator(socket, data));
    socket.on('leaveSpectator', (data) => spectatorHandlers.handleLeaveSpectator(socket, data));

    // Error handling
    socket.on('error', (error) => {
      console.error('[Socket Error]', error);
    });
  });
};

module.exports = { socketManager, RoomService };