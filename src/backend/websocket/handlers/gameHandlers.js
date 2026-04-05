/**
 * Game lifecycle event handlers
 */

const gameHandlers = {
  /**
   * Handle player joining game
   */
  handleJoinGame(socket, data) {
    const { gameId, playerId, playerName } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return socket.emit('error', { message: 'Game not found' });
      }

      // Add player to room
      socket.roomService.joinRoom(gameId, playerId, playerName);

      // Join socket room
      socket.join(gameId);

      // Notify others
      socket.to(gameId).emit('playerJoined', {
        playerId,
        playerName,
        playerCount: room.players.length,
      });

      // Send initial game state
      const gameState = room.gameSession.getGameState();
      socket.emit('gameStateUpdated', gameState);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  /**
   * Handle player leaving game
   */
  handleLeaveGame(socket, data) {
    const { gameId, playerId } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return socket.emit('error', { message: 'Game not found' });
      }

      socket.roomService.leaveRoom(gameId, playerId);
      socket.leave(gameId);

      socket.to(gameId).emit('playerLeft', { playerId });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  /**
   * Handle game start
   */
  handleStartGame(socket, data) {
    const { gameId, playerId } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return socket.emit('error', { message: 'Game not found' });
      }

      if (room.hostId !== playerId) {
        return socket.emit('error', { message: 'Only host can start game' });
      }

      room.gameSession.startGame();

      const gameState = room.gameSession.getGameState();
      socket.to(gameId).emit('gameStarted', gameState);
      socket.emit('gameStarted', gameState);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  /**
   * Handle get game state request
   */
  handleGetGameState(socket, callback) {
    try {
      // Find which game this socket is in
      const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

      if (!gameId) {
        return callback({ success: false, error: 'Not in a game' });
      }

      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const gameState = room.gameSession.getGameState();
      callback({ success: true, data: gameState });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },
};

module.exports = gameHandlers;