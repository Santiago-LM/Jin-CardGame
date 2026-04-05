/**
 * WebSocket client wrapper with event handling
 */

export class WebSocketClient {
  constructor(url = 'http://localhost:3000') {
    this.socket = null;
    this.url = url;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;

    this.connect();
  }

  /**
   * Connect to socket server
   */
  connect() {
    // Check if Socket.io is available
    if (typeof io === 'undefined') {
      console.error('Socket.io library not loaded');
      return;
    }

    this.socket = io(this.url, {
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
  }

  /**
   * Setup default socket listeners
   */
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.emit('disconnected', {});
    });

    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', { error });
    });
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.socket) return () => {};

    this.socket.on(event, callback);

    // Return unsubscribe function
    return () => this.socket.off(event, callback);
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Emit with acknowledgment (server responds)
   */
  emitWithAck(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit(event, data, (response) => {
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  }

  /**
   * Join game room
   */
  joinGame(gameId, playerId, playerName) {
    this.emit('joinGame', { gameId, playerId, playerName });
  }

  /**
   * Leave game room
   */
  leaveGame(gameId, playerId) {
    this.emit('leaveGame', { gameId, playerId });
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.emitWithAck('getGameState', {});
  }

  /**
   * Play move
   */
  playMove(gameId, playerId, moveData) {
    return this.emitWithAck('playMove', {
      gameId,
      playerId,
      moveData,
    });
  }

  /**
   * Draw from deck
   */
  drawFromDeck(gameId, playerId) {
    return this.emitWithAck('drawFromDeck', {
      gameId,
      playerId,
    });
  }

  /**
   * Draw from pile
   */
  drawFromPile(gameId, playerId, cardIndex) {
    return this.emitWithAck('drawFromPile', {
      gameId,
      playerId,
      cardIndex,
    });
  }

  /**
   * Steal from pile
   */
  stealFromPile(gameId, playerId, pileIndices, paymentCardId) {
    return this.emitWithAck('stealFromPile', {
      gameId,
      playerId,
      pileIndices,
      paymentCardId,
    });
  }

  /**
   * Play sets
   */
  playSets(gameId, playerId, cardIds) {
    return this.emitWithAck('playSets', {
      gameId,
      playerId,
      cardIds,
    });
  }

  /**
   * Play JIN
   */
  playJIN(gameId, playerId, cardIds) {
    return this.emitWithAck('playJIN', {
      gameId,
      playerId,
      cardIds,
    });
  }

  /**
   * Discard cards
   */
  discardCards(gameId, playerId, cardIds) {
    return this.emitWithAck('discardCards', {
      gameId,
      playerId,
      cardIds,
    });
  }

  /**
   * Start game
   */
  startGame(gameId, playerId) {
    return this.emitWithAck('startGame', {
      gameId,
      playerId,
    });
  }

  /**
   * Join as spectator
   */
  joinAsSpectator(gameId, spectatorId) {
    this.emit('joinAsSpectator', {
      gameId,
      spectatorId,
    });
  }

  /**
   * Leave as spectator
   */
  leaveAsSpectator(gameId, spectatorId) {
    this.emit('leaveSpectator', {
      gameId,
      spectatorId,
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Check if connected
   */
  isConnectedToServer() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}