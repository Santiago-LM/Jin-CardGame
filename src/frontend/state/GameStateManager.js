/**
 * Centralized game state with subscription pattern
 */

import { EventBus } from './EventBus.js';

export class GameStateManager {
  constructor() {
    this.state = {
      // Game info
      gameId: null,
      playerId: null,
      playerName: null,
      gameMode: 'casual',
      status: 'WAITING',

      // Players
      players: [],
      currentPlayerIndex: 0,
      currentPlayerId: null,
      spectators: [],

      // Game state
      playerHand: [],
      communityPile: [],
      deckSize: 0,
      round: 1,
      scores: {},
      history: [],

      // UI state
      selectedCards: new Set(),
      selectedPileIndices: new Set(),
      moveInProgress: false,
      lastError: null,
      inactivityWarning: false,
      isSpectating: false,
    };

    this.subscribers = [];
    this.eventBus = new EventBus();
  }

  /**
   * Update state and notify subscribers
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers
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
      selectedCards: new Set(),
      selectedPileIndices: new Set(),
      moveInProgress: false,
      lastError: null,
      inactivityWarning: false,
    });
  }

  // Card selection
  selectCard(cardId) {
    const selected = new Set(this.state.selectedCards);
    if (selected.has(cardId)) {
      selected.delete(cardId);
    } else {
      selected.add(cardId);
    }
    this.setState({ selectedCards: selected });
  }

  clearSelectedCards() {
    this.setState({ selectedCards: new Set() });
  }

  selectPileIndex(index) {
    const selected = new Set();
    for (let i = 0; i <= index; i++) {
      selected.add(i);
    }
    this.setState({ selectedPileIndices: selected });
  }

  clearSelectedPileIndices() {
    this.setState({ selectedPileIndices: new Set() });
  }

  // Error handling
  setError(error) {
    this.setState({ lastError: error });
  }

  clearError() {
    this.setState({ lastError: null });
  }

  // Move status
  setMoveInProgress(inProgress) {
    this.setState({ moveInProgress: inProgress });
  }

  // Helper methods
  isCurrentPlayer(playerId = null) {
    const id = playerId || this.state.playerId;
    const player = this.state.players[this.state.currentPlayerIndex];
    return player && player.id === id;
  }

  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex] || null;
  }
}