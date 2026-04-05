/**
 * Player connection event handlers
 */

export const playerHandlers = {
  /**
   * Handle player disconnect
   */
  handleDisconnect(socket) {
    console.log(`[Disconnect] Player: ${socket.id}`);

    // Find which game this socket is in
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    if (gameId) {
      const room = socket.roomService.getRoom(gameId);

      if (room) {
        const playerId = Object.keys(socket.handshake.query).find(key =>
          socket.handshake.query[key] === socket.id
        );

        if (playerId) {
          room.gameSession.handleDisconnect(playerId);

          // Start inactivity timer (3 minutes)
          setTimeout(() => {
            const inactiveIds = room.gameSession.checkInactivity();
            if (inactiveIds.includes(playerId)) {
              socket.to(gameId).emit('playerKicked', {
                playerId,
                reason: 'Inactivity timeout',
              });
            }
          }, 3 * 60 * 1000);

          socket.to(gameId).emit('playerDisconnected', { playerId });
        }
      }
    }
  },

  /**
   * Handle player reconnect
   */
  handleReconnect(socket) {
    console.log(`[Reconnect] Player: ${socket.id}`);

    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    if (gameId) {
      const room = socket.roomService.getRoom(gameId);

      if (room) {
        const playerId = Object.keys(socket.handshake.query).find(key =>
          socket.handshake.query[key] === socket.id
        );

        if (playerId) {
          room.gameSession.handleReconnect(playerId);
          socket.to(gameId).emit('playerReconnected', { playerId });

          // Send updated game state
          const gameState = room.gameSession.getGameState();
          socket.emit('gameStateUpdated', gameState);
        }
      }
    }
  },
};