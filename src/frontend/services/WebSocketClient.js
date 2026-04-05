/**
 * WebSocket client wrapper with event handling
 */

import { Logger } from '../utils/logger.js';

export class WebSocketClient {
  constructor(url = 'http://localhost:3000') {
    this.socket = null;
    this.url = url;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.token = null;
  }

  /**
   * Connect to socket server
   */
  connect(token = null) {
    if (token) {
      this.token = token;
    }

    if (typeof io === 'undefined') {
      Logger.error('Socket.io library not loaded');
      return;
    }

    this.socket = io(this.url, {
      auth: { token: this.token },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
    Logger.info('WebSocket connecting...');
  }

  /**
   * Setup default socket listeners
   */
  setupListeners() {
    this.socket.on('connect', () => {
      Logger.info('✓ Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    });

    this.socket.on('disconnect', () => {
      Logger.warn('✗ Disconnected from server');
      this.isConnected = false;
      this.emit('disconnected', {});
    });

    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      Logger.warn(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
    });

    this.socket.on('error', (error) => {
      Logger.error('Socket error:', error);
      this.emit('error', { error });
    });
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.socket) return () => {};

    this.socket.on(event, callback);

    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (!this.socket) {
      Logger.warn('Socket not connected, cannot emit:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Emit with acknowledgment
   */
  emitWithAck(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit(event, data, (response) => {
        if (response && response.success) {
          resolve(response.data || response);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  }

  // Game operations
  joinGame(gameId, playerId, playerName) {
    this.emit('joinGame', { gameId, playerId, playerName });
  }

  leaveGame(gameId, playerId) {
    this.emit('leaveGame', { gameId, playerId });
  }

  getGameState() {
    return this.emitWithAck('getGameState', {});
  }

  drawFromDeck(gameId, playerId) {
    return this.emitWithAck('drawFromDeck', { gameId, playerId });
  }

  drawFromPile(gameId, playerId, cardIndex) {
    return this.emitWithAck('drawFromPile', { gameId, playerId, cardIndex });
  }

  stealFromPile(gameId, playerId, pileIndices, paymentCardId) {
    return this.emitWithAck('stealFromPile', { gameId, playerId, pileIndices, paymentCardId });
  }

  playSets(gameId, playerId, cardIds) {
    return this.emitWithAck('playSets', { gameId, playerId, cardIds });
  }

  playJIN(gameId, playerId, cardIds) {
    return this.emitWithAck('playJIN', { gameId, playerId, cardIds });
  }

  discardCards(gameId, playerId, cardIds) {
    return this.emitWithAck('discardCards', { gameId, playerId, cardIds });
  }

  startGame(gameId, playerId) {
    return this.emitWithAck('startGame', { gameId, playerId });
  }

  joinAsSpectator(gameId, spectatorId) {
    this.emit('joinAsSpectator', { gameId, spectatorId });
  }

  leaveAsSpectator(gameId, spectatorId) {
    this.emit('leaveSpectator', { gameId, spectatorId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnectedToServer() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}