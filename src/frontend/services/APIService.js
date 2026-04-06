/**
 * REST API service
 */

import { StorageService } from './StorageService.js';

export class APIService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  /**
   * Get stored token via StorageService (consistent regalem_ prefix)
   */
  getStoredToken() {
    return StorageService.getToken();
  }

  /**
   * Set token via StorageService (consistent regalem_ prefix)
   */
  setToken(token) {
    this.token = token;
    if (token) {
      StorageService.setToken(token);
    } else {
      StorageService.clearAuth();
    }
  }

  /**
   * Make request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Auth endpoints
   */
  register(username, email, password) {
    return this.post('/auth/register', { username, email, password });
  }

  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  verifyToken(token) {
    return this.post('/auth/verify', { token });
  }

  getCurrentUser() {
    return this.get('/auth/me');
  }

  /**
   * Room endpoints
   */
  createRoom(roomConfig) {
    return this.post('/rooms/create', { roomConfig });
  }

  getPublicRooms() {
    return this.get('/rooms/public');
  }

  getRoom(roomId) {
    return this.get(`/rooms/${roomId}`);
  }

  getRoomStatus(roomId) {
    return this.get(`/rooms/${roomId}/status`);
  }

  joinRoom(roomId, playerName) {
    return this.post(`/rooms/${roomId}/join`, { playerName });
  }

  leaveRoom(roomId) {
    return this.post(`/rooms/${roomId}/leave`, {});
  }

  /**
   * Leaderboard endpoints
   */
  getGlobalLeaderboard(limit = 100) {
    return this.get(`/leaderboard/global?limit=${limit}`);
  }

  getLeaderboardByMode(mode, limit = 100) {
    return this.get(`/leaderboard/${mode}?limit=${limit}`);
  }

  getUserRank(userId) {
    return this.get(`/leaderboard/rank/${userId}`);
  }

  /**
   * Profile endpoints
   */
  getUserProfile(userId) {
    return this.get(`/profile/${userId}`);
  }

  updateProfile(userId, updates) {
    return this.put(`/profile/${userId}`, updates);
  }

  getGameHistory(userId, limit = 50) {
    return this.get(`/profile/${userId}/history?limit=${limit}`);
  }

  getStatsByMode(userId) {
    return this.get(`/profile/${userId}/stats`);
  }
}