/**
 * RegalemClient — Unified client managing authentication, room, and socket state.
 * Single source of truth for all app state on the frontend.
 */

import { StorageService } from './StorageService.js';
import { APIService } from './APIService.js';
import { WebSocketClient } from './WebSocketClient.js';
import { EventBus } from '../state/EventBus.js';

export class RegalemClient {
  constructor() {
    this.api = new APIService();
    this.socket = new WebSocketClient();
    this.events = new EventBus();

    // Restore persisted state
    this.token = StorageService.getToken();
    this.user = StorageService.getUser();
    this.currentRoom = null;

    if (this.token) {
      this.api.setToken(this.token);
    }
  }

  // ── Authentication ─────────────────────────────────────────────────────────

  isAuthenticated() {
    return !!(this.token && this.user && this.user.username);
  }

  async login(email, password) {
    const response = await this.api.login(email, password);
    this._persistAuth(response.token, response.user);
    this.events.emit('auth:login', response.user);
    return response;
  }

  async register(username, email, password) {
    const response = await this.api.register(username, email, password);
    this._persistAuth(response.token, response.user);
    this.events.emit('auth:register', response.user);
    return response;
  }

  logout() {
    StorageService.clearAuth();
    this.token = null;
    this.user = null;
    this.api.setToken(null);
    this.socket.disconnect();
    this.events.emit('auth:logout', {});
  }

  _persistAuth(token, user) {
    this.token = token;
    this.user = user;
    StorageService.setToken(token);
    StorageService.setUser(user);
    this.api.setToken(token);
    this.socket.connect(token);
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async createRoom(roomConfig) {
    const result = await this.api.createRoom(roomConfig);
    this.currentRoom = result.roomId;
    this.events.emit('room:created', result);
    return result;
  }

  async joinRoom(roomId) {
    const result = await this.api.joinRoom(roomId);
    this.currentRoom = roomId;
    this.events.emit('room:joined', { roomId, ...result });
    return result;
  }

  async leaveRoom(roomId) {
    const result = await this.api.leaveRoom(roomId || this.currentRoom);
    this.currentRoom = null;
    this.events.emit('room:left', {});
    return result;
  }

  async getPublicRooms() {
    return this.api.getPublicRooms();
  }

  // ── Socket ─────────────────────────────────────────────────────────────────

  connectSocket() {
    if (this.token) {
      this.socket.connect(this.token);
    }
  }
}
