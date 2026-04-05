/**
 * Game move event handlers
 */

const moveHandlers = {
  /**
   * Handle play move (generic)
   */
  handlePlayMove(socket, data, callback) {
    const { gameId, playerId, moveData } = data;

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const result = room.gameSession.processMove(playerId, moveData);

      // Broadcast to all players
      socket.to(gameId).emit('moveApplied', {
        playerId,
        moveType: moveData.type,
        gameState: result.gameState,
      });

      callback({ success: true, data: result.gameState });
    } catch (error) {
      callback({ success: false, error: error.message });
      socket.to(gameId).emit('moveRejected', {
        playerId,
        reason: error.message,
      });
    }
  },

  /**
   * Handle draw from deck
   */
  handleDrawFromDeck(socket, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();
      const card = room.gameSession.currentRound.deck.drawCard();

      player.addCards([card]);

      const gameState = room.gameSession.getGameState();

      socket.to(gameId).emit('cardDrawn', {
        playerId: player.id,
        cardCount: player.hand.length,
      });

      callback({ success: true, data: { gameState } });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },

  /**
   * Handle draw from pile
   */
  handleDrawFromPile(socket, data, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const { cardIndex } = data;
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();
      const card = room.gameSession.currentRound.communityPile.getCard(cardIndex);

      room.gameSession.currentRound.communityPile.removeCards([cardIndex]);
      player.addCards([card]);

      const gameState = room.gameSession.getGameState();

      socket.to(gameId).emit('cardDrawnFromPile', {
        playerId: player.id,
        cardIndex,
        cardCount: player.hand.length,
      });

      callback({ success: true, data: { gameState } });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },

  /**
   * Handle steal from pile
   */
  handleStealFromPile(socket, data, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const { pileIndices, paymentCardId } = data;
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();
      const stolenCards = room.gameSession.currentRound.communityPile.removeCards(pileIndices);

      player.addCards(stolenCards);

      // Must discard one card back
      if (paymentCardId) {
        const paymentCard = stolenCards.find(c => c.id === paymentCardId);
        if (paymentCard) {
          player.removeCards([paymentCardId]);
          room.gameSession.currentRound.communityPile.addCard(paymentCard);
        }
      }

      const gameState = room.gameSession.getGameState();

      socket.to(gameId).emit('stolePile', {
        playerId: player.id,
        cardCount: stolenCards.length,
        paidBack: 1,
      });

      callback({ success: true, data: { gameState } });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },

  /**
   * Handle play sets
   */
  handlePlaySets(socket, data, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const { cardIds } = data;
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();

      // Remove cards from hand
      player.removeCards(cardIds);

      const gameState = room.gameSession.getGameState();

      socket.to(gameId).emit('setsPlayed', {
        playerId: player.id,
        cardCount: cardIds.length,
      });

      callback({ success: true, data: { gameState } });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },

  /**
   * Handle JIN play
   */
  handlePlayJIN(socket, data, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const { cardIds } = data;
      const room = socket.roomService.getGame(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();
      player.removeCards(cardIds);
      player.didJIN = true;

      // Round ends immediately
      const result = room.gameSession.endRound();

      socket.to(gameId).emit('jinPlayed', {
        playerId: player.id,
        message: `${player.name} played JIN!`,
        animation: 'jin-celebration',
      });

      socket.to(gameId).emit('roundEnd', result);
      callback({ success: true, data: result });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },

  /**
   * Handle discard
   */
  handleDiscard(socket, data, callback) {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);

    try {
      const { cardIds } = data;
      const room = socket.roomService.getRoom(gameId);

      if (!room) {
        return callback({ success: false, error: 'Game not found' });
      }

      const player = room.gameSession.getCurrentPlayer();
      const cards = cardIds.map(id => player.hand.find(c => c.id === id));

      player.removeCards(cardIds);
      room.gameSession.currentRound.communityPile.addCards(cards);

      const gameState = room.gameSession.getGameState();

      socket.to(gameId).emit('cardsDiscarded', {
        playerId: player.id,
        cardCount: cardIds.length,
      });

      callback({ success: true, data: { gameState } });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  },
};

module.exports = moveHandlers;