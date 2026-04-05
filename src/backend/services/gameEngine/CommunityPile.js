/**
 * Community pile management
 */

class CommunityPile {
  constructor() {
    this.pile = [];
  }

  /**
   * Add card to pile
   */
  addCard(card) {
    this.pile.push(card);
  }

  /**
   * Add multiple cards to pile
   */
  addCards(cards) {
    this.pile.push(...cards);
  }

  /**
   * Remove cards by index (taking from top)
   */
  removeCards(indices) {
    if (!Array.isArray(indices) || indices.length === 0) {
      throw new Error('No cards to remove');
    }

    // Validate consecutive from top
    const sorted = [...indices].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i) {
        throw new Error('Must take consecutive cards from top of pile');
      }
    }

    const removed = this.pile.splice(0, indices.length);
    return removed;
  }

  /**
   * Get card at index
   */
  getCard(index) {
    if (index < 0 || index >= this.pile.length) {
      throw new Error('Invalid card index');
    }
    return this.pile[index];
  }

  /**
   * Get all cards
   */
  getCards() {
    return [...this.pile];
  }

  /**
   * Get pile size
   */
  getSize() {
    return this.pile.length;
  }

  /**
   * Check if empty
   */
  isEmpty() {
    return this.pile.length === 0;
  }

  /**
   * Clear pile
   */
  clear() {
    this.pile = [];
  }

  /**
   * Get top card without removing
   */
  peekTop() {
    return this.pile[0] || null;
  }
}

module.exports = { CommunityPile };