/**
 * Centralized game state with subscription pattern
 * Single source of truth for all game data
 */

export class GameStateManager {
  constructor() {
    this.state = {
      gameId: null,
      playerId: null,
      playerName: null,
      players: [],
      currentPlayerIndex: 0,
      currentPlayerId: null,
      playerHand: [],
      communityPile: [],
      deckSize: 0,
      round: 1,
      status: 'WAITING', // WAITING | IN_PROGRESS | ROUND_END | GAME_END
      scores: {},
      history: [],
      isSpectating: false,
      spectators: [],
      inactivityWarning: false,
      moveInProgress: false,
      selectedCards: new Set(),
      selectedPileIndices: new Set(),
      gameMode: 'casual',
      lastError: null,
    };

    this.subscribers = [];
    this.eventBus = new EventBus();
  }

  /**
   * Update state and notify all subscribers
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   * Callback receives entire state object
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get specific state slice
   */
  getSlice(key) {
    return this.state[key];
  }

  /**
   * Update specific slice
   */
  updateSlice(key, value) {
    this.setState({ [key]: value });
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.setState({
      gameId: null,
      playerId: null,
      playerName: null,
      players: [],
      currentPlayerIndex: 0,
      currentPlayerId: null,
      playerHand: [],
      communityPile: [],
      deckSize: 0,
      round: 1,
      status: 'WAITING',
      scores: {},
      history: [],
      isSpectating: false,
      spectators: [],
      inactivityWarning: false,
      moveInProgress: false,
      selectedCards: new Set(),
      selectedPileIndices: new Set(),
      lastError: null,
    });
  }

  /**
   * Add card to selected
   */
  selectCard(cardId) {
    const selected = new Set(this.state.selectedCards);
    if (selected.has(cardId)) {
      selected.delete(cardId);
    } else {
      selected.add(cardId);
    }
    this.setState({ selectedCards: selected });
  }

  /**
   * Clear selected cards
   */
  clearSelectedCards() {
    this.setState({ selectedCards: new Set() });
  }

  /**
   * Add pile index to selected
   */
  selectPileIndex(index) {
    const selected = new Set(this.state.selectedPileIndices);
    // Selecting a pile card means taking all cards above it
    selected.clear();
    for (let i = 0; i <= index; i++) {
      selected.add(i);
    }
    this.setState({ selectedPileIndices: selected });
  }

  /**
   * Clear selected pile indices
   */
  clearSelectedPileIndices() {
    this.setState({ selectedPileIndices: new Set() });
  }

  /**
   * Set error
   */
  setError(error) {
    this.setState({ lastError: error });
  }

  /**
   * Clear error
   */
  clearError() {
    this.setState({ lastError: null });
  }

  /**
   * Set move in progress
   */
  setMoveInProgress(inProgress) {
    this.setState({ moveInProgress: inProgress });
  }

  /**
   * Is current player
   */
  isCurrentPlayer(playerId = null) {
    const id = playerId || this.state.playerId;
    const player = this.state.players[this.state.currentPlayerIndex];
    return player && player.id === id;
  }

  /**
   * Get current player
   */
  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex] || null;
  }
}