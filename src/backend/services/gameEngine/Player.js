/**
 * Player entity and state management
 */

class Player {
  constructor(playerId, playerName = '') {
    this.id = playerId;
    this.name = playerName;
    this.hand = [];
    this.totalScore = 0;
    this.roundScore = 0;
    this.isActive = true;
    this.lastActivity = Date.now();
    this.setsPlayed = [];
    this.roundsPlayed = 0;
    this.wins = 0;
    this.losses = 0;
  }

  /**
   * Set player's hand
   */
  setHand(cards) {
    this.hand = [...cards];
    this.updateActivity();
  }

  /**
   * Add cards to hand
   */
  addCards(cards) {
    this.hand.push(...cards);
    this.updateActivity();
  }

  /**
   * Remove cards from hand by ID
   */
  removeCards(cardIds) {
    this.hand = this.hand.filter(card => !cardIds.includes(card.id));
    this.updateActivity();
  }

  /**
   * Get hand size
   */
  getHandSize() {
    return this.hand.length;
  }

  /**
   * Check if card in hand
   */
  hasCard(cardId) {
    return this.hand.some(card => card.id === cardId);
  }

  /**
   * Add score
   */
  addScore(points) {
    this.roundScore += points;
    this.totalScore += points;
    this.updateActivity();
  }

  /**
   * Set round score
   */
  setRoundScore(points) {
    this.roundScore = points;
    this.updateActivity();
  }

  /**
   * Reset round score
   */
  resetRoundScore() {
    this.roundScore = 0;
  }

  /**
   * Set active status
   */
  setActive(isActive) {
    this.isActive = isActive;
  }

  /**
   * Update last activity timestamp
   */
  updateActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Record win
   */
  recordWin() {
    this.wins++;
  }

  /**
   * Record loss
   */
  recordLoss() {
    this.losses++;
  }

  /**
   * Get win rate
   */
  getWinRate() {
    const total = this.wins + this.losses;
    return total === 0 ? 0 : Math.round((this.wins / total) * 100);
  }

  /**
   * Check if inactive (3 minutes)
   */
  isInactive(timeoutMs = 3 * 60 * 1000) {
    return !this.isActive && (Date.now() - this.lastActivity > timeoutMs);
  }

  /**
   * Get player state for transmission
   */
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      handSize: this.hand.length,
      totalScore: this.totalScore,
      roundScore: this.roundScore,
      isActive: this.isActive,
      wins: this.wins,
      losses: this.losses,
      winRate: this.getWinRate(),
    };
  }

  /**
   * Get player state including hand
   */
  getPrivateState() {
    return {
      ...this.getPublicState(),
      hand: this.hand,
    };
  }
}

module.exports = { Player };