/**
 * Single game round management
 */

const { CommunityPile } = require('./CommunityPile');
const { CardDeck } = require('./CardDeck');

class GameRound {
  constructor(players, roundNumber = 1) {
    this.players = players;
    this.roundNumber = roundNumber;
    this.currentPlayerIndex = 0;
    this.deck = new CardDeck(players.length);
    this.communityPile = new CommunityPile();
    this.setsPlayed = [];
    this.moveHistory = [];
    this.hasFirstPlay = false;
    this.startTime = null;
  }

  /**
   * Start round
   */
  start() {
    this.startTime = Date.now();
    this.dealCards();
  }

  /**
   * Deal cards to all players
   */
  dealCards() {
    const hands = this.deck.dealCards(this.players.length);
    this.players.forEach((player, index) => {
      player.setHand(hands[index]);
    });
  }

  /**
   * Get current player
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Advance to next player
   */
  advanceToNextPlayer() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (!this.getCurrentPlayer().isActive);
  }

  /**
   * Apply move to round state
   */
  applyMove(player, moveData) {
    const { type, cardIds } = moveData;

    switch (type) {
      case 'PLAY_SETS':
        this.handlePlaySets(player, cardIds);
        break;
      case 'DRAW_DECK':
        this.handleDrawDeck(player);
        break;
      case 'DRAW_PILE':
        this.handleDrawPile(player, moveData.cardIndex);
        break;
      case 'STEAL_PILE':
        this.handleStealPile(player, moveData.indices, moveData.paymentCardId);
        break;
      case 'DISCARD':
        this.handleDiscard(player, cardIds);
        break;
      case 'JIN':
        this.handleJIN(player, cardIds);
        break;
    }

    this.moveHistory.push({
      playerId: player.id,
      type,
      timestamp: Date.now(),
    });

    this.advanceToNextPlayer();
  }

  /**
   * Handle playing sets
   */
  handlePlaySets(player, cardIds) {
    const cards = cardIds.map(id => player.hand.find(c => c.id === id));
    player.removeCards(cardIds);
    this.setsPlayed.push(...cards);
    this.hasFirstPlay = true;
  }

  /**
   * Handle drawing from deck
   */
  handleDrawDeck(player) {
    const card = this.deck.drawCard();
    player.addCards([card]);
  }

  /**
   * Handle drawing from pile
   */
  handleDrawPile(player, cardIndex) {
    const card = this.communityPile.getCard(cardIndex);
    this.communityPile.removeCards([cardIndex]);
    player.addCards([card]);
  }

  /**
   * Handle stealing from pile
   */
  handleStealPile(player, indices, paymentCardId) {
    const stolenCards = this.communityPile.removeCards(indices);
    player.addCards(stolenCards);

    // Must discard one card back
    if (paymentCardId) {
      const paymentCard = stolenCards.find(c => c.id === paymentCardId);
      if (paymentCard) {
        player.removeCards([paymentCardId]);
        this.communityPile.addCard(paymentCard);
      }
    }
  }

  /**
   * Handle discard
   */
  handleDiscard(player, cardIds) {
    const cards = cardIds.map(id => player.hand.find(c => c.id === id));
    player.removeCards(cardIds);
    this.communityPile.addCards(cards);
  }

  /**
   * Handle JIN play
   */
  handleJIN(player, cardIds) {
    const cards = cardIds.map(id => player.hand.find(c => c.id === id));
    player.removeCards(cardIds);
    player.didJIN = true;
    this.setsPlayed.push(...cards);
  }

  /**
   * Check if round is ended
   */
  isEnded() {
    return this.players.some(p => p.hand.length === 0);
  }

  /**
   * Get round state
   */
  getState() {
    return {
      roundNumber: this.roundNumber,
      currentPlayerIndex: this.currentPlayerIndex,
      hasFirstPlay: this.hasFirstPlay,
      communityPileSize: this.communityPile.getSize(),
      deckSize: this.deck.getRemainingCount(),
      moveCount: this.moveHistory.length,
    };
  }
}

module.exports = { GameRound };