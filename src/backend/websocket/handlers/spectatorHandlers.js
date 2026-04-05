/**
 * Spectator event handlers
 */

export const spectatorHandlers = {
  /**
   * Handle spectator join
   */
  handleJoinSpectator(socket, data) {
    const { gameId, spectatorId } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return socket.emit('error', { message: 'Game not found' });
      }

      room.gameSession.addSpectator(spectatorId);
      socket.join(gameId);

      // Send game state (without private hands)
      const gameState = room.gameSession.getGameState(true);
      socket.emit('spectatorJoined', gameState);

      socket.to(gameId).emit('spectatorJoined', {
        spectatorId,
        spectatorCount: room.gameSession.spectators.length,
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },

  /**
   * Handle spectator leave
   */
  handleLeaveSpectator(socket, data) {
    const { gameId, spectatorId } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return socket.emit('error', { message: 'Game not found' });
      }

      room.gameSession.removeSpectator(spectatorId);
      socket.leave(gameId);

      socket.to(gameId).emit('spectatorLeft', {
        spectatorId,
        spectatorCount: room.gameSession.spectators.length,
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  },
};