/**
 * Card deck management
 */

const { v4: uuidv4 } = require('uuid');
const { CARD_RANKS, CARD_SUITS, PLAYER_LIMITS } = require('../../../shared/constants');

class CardDeck {
  constructor(playerCount = 2) {
    this.playerCount = playerCount;
    this.deckMultiplier = PLAYER_LIMITS[playerCount] || 1;
    this.cards = [];
    this.discarded = [];
    this.initialize();
  }

  /**
   * Initialize deck with correct number of decks
   */
  initialize() {
    this.cards = [];

    for (let d = 0; d < this.deckMultiplier; d++) {
      // Standard cards
      CARD_RANKS.forEach(rank => {
        if (rank === 'JOKER') {
          // 2 Jokers per deck
          for (let j = 0; j < 2; j++) {
            this.cards.push({
              id: uuidv4(),
              rank: 'JOKER',
              suit: 'WILD',
            });
          }
        } else {
          // 4 of each rank (one per suit)
          CARD_SUITS.forEach(suit => {
            this.cards.push({
              id: uuidv4(),
              rank,
              suit,
            });
          });
        }
      });
    }

    this.shuffle();
  }

  /**
   * Shuffle deck (Fisher-Yates)
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Draw card from deck
   */
  drawCard() {
    if (this.cards.length === 0) {
      // Reshuffle discarded cards
      if (this.discarded.length === 0) {
        throw new Error('No cards available to draw');
      }
      this.cards = [...this.discarded];
      this.discarded = [];
      this.shuffle();
    }

    return this.cards.pop();
  }

  /**
   * Draw multiple cards
   */
  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      drawn.push(this.drawCard());
    }
    return drawn;
  }

  /**
   * Deal cards to players
   */
  dealCards(playerCount, cardsPerPlayer = 16) {
    const hands = Array(playerCount).fill(null).map(() => []);

    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let p = 0; p < playerCount; p++) {
        hands[p].push(this.drawCard());
      }
    }

    return hands;
  }

  /**
   * Discard card
   */
  discardCard(card) {
    this.discarded.push(card);
  }

  /**
   * Get remaining cards count
   */
  getRemainingCount() {
    return this.cards.length;
  }

  /**
   * Check if deck has cards
   */
  hasCards() {
    return this.cards.length > 0 || this.discarded.length > 0;
  }

  /**
   * Peek at top card
   */
  peekCard() {
    return this.cards[this.cards.length - 1] || null;
  }

  /**
   * Get deck state (for testing/debugging)
   */
  getState() {
    return {
      remainingCards: this.cards.length,
      discardedCards: this.discarded.length,
      deckMultiplier: this.deckMultiplier,
    };
  }
}

module.exports = { CardDeck };