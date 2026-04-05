/**
 * Socket.io setup and connection handling
 */

import { RoomService } from '../services/roomService.js';
import { gameHandlers } from './handlers/gameHandlers.js';
import { moveHandlers } from './handlers/moveHandlers.js';
import { playerHandlers } from './handlers/playerHandlers.js';
import { spectatorHandlers } from './handlers/spectatorHandlers.js';

const roomService = new RoomService();

export function socketManager(io) {
  io.on('connection', (socket) => {
    console.log(`\n[Connect] Player: ${socket.id}`);
    console.log(`[Info] Total connected: ${io.engine.clientsCount}`);

    // Attach room service to socket
    socket.roomService = roomService;
    socket.io = io;

    // ========== Game lifecycle events ==========
    socket.on('joinGame', (data) => {
      console.log(`[joinGame] ${socket.id}`, data);
      gameHandlers.handleJoinGame(socket, data);
    });

    socket.on('leaveGame', (data) => {
      console.log(`[leaveGame] ${socket.id}`, data);
      gameHandlers.handleLeaveGame(socket, data);
    });

    socket.on('startGame', (data) => {
      console.log(`[startGame] ${socket.id}`, data);
      gameHandlers.handleStartGame(socket, data);
    });

    socket.on('getGameState', (callback) => {
      console.log(`[getGameState] ${socket.id}`);
      gameHandlers.handleGetGameState(socket, callback);
    });

    // ========== Move events ==========
    socket.on('playMove', (data, callback) => {
      console.log(`[playMove] ${socket.id}`, data.moveData?.type);
      moveHandlers.handlePlayMove(socket, data, callback);
    });

    socket.on('drawFromDeck', (callback) => {
      console.log(`[drawFromDeck] ${socket.id}`);
      moveHandlers.handleDrawFromDeck(socket, callback);
    });

    socket.on('drawFromPile', (data, callback) => {
      console.log(`[drawFromPile] ${socket.id}`, data);
      moveHandlers.handleDrawFromPile(socket, data, callback);
    });

    socket.on('stealFromPile', (data, callback) => {
      console.log(`[stealFromPile] ${socket.id}`, data);
      moveHandlers.handleStealFromPile(socket, data, callback);
    });

    socket.on('playSets', (data, callback) => {
      console.log(`[playSets] ${socket.id}`, data);
      moveHandlers.handlePlaySets(socket, data, callback);
    });

    socket.on('playJIN', (data, callback) => {
      console.log(`[playJIN] ${socket.id}`, data);
      moveHandlers.handlePlayJIN(socket, data, callback);
    });

    socket.on('discardCards', (data, callback) => {
      console.log(`[discardCards] ${socket.id}`, data);
      moveHandlers.handleDiscard(socket, data, callback);
    });

    // ========== Player events ==========
    socket.on('disconnect', () => {
      playerHandlers.handleDisconnect(socket);
    });

    socket.on('reconnect', () => {
      playerHandlers.handleReconnect(socket);
    });

    // ========== Spectator events ==========
    socket.on('joinAsSpectator', (data) => {
      console.log(`[joinAsSpectator] ${socket.id}`, data);
      spectatorHandlers.handleJoinSpectator(socket, data);
    });

    socket.on('leaveSpectator', (data) => {
      console.log(`[leaveSpectator] ${socket.id}`, data);
      spectatorHandlers.handleLeaveSpectator(socket, data);
    });

    // ========== Error handling ==========
    socket.on('error', (error) => {
      console.error(`[Socket Error] ${socket.id}:`, error);
    });
  });
}

export { RoomService };