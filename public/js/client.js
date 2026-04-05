/**
 * Regalem Client - Main game client
 */

class RegalemClient {
  constructor() {
    this.token = localStorage.getItem('regalem_token');
    this.user = JSON.parse(localStorage.getItem('regalem_user') || '{}');
    this.socket = null;
    this.currentRoom = null;
    this.gameState = null;
    this.apiBase = 'http://localhost:3000/api';
  }

  // ========== Authentication ==========
  async register(username, email, password) {
    try {
      const response = await fetch(`${this.apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('regalem_token', data.token);
        localStorage.setItem('regalem_user', JSON.stringify(data.user));
        console.log('✓ Registered successfully');
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('regalem_token', data.token);
        localStorage.setItem('regalem_user', JSON.stringify(data.user));
        console.log('✓ Logged in successfully');
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = {};
    localStorage.removeItem('regalem_token');
    localStorage.removeItem('regalem_user');
    console.log('✓ Logged out');
  }

  isAuthenticated() {
    return !!this.token && !!this.user.username;
  }

  // ========== Room Management ==========
  async createRoom(roomConfig) {
    try {
      const response = await fetch(`${this.apiBase}/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ roomConfig }),
      });

      const data = await response.json();

      if (data.success) {
        this.currentRoom = {
          id: data.roomId,
          hostId: data.hostId,
          config: data.config,
        };
        console.log(`✓ Room created: ${data.roomId}`);
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  }

  async joinRoom(roomId, playerName) {
    try {
      const response = await fetch(`${this.apiBase}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ playerName }),
      });

      const data = await response.json();

      if (data.success) {
        this.currentRoom = {
          id: roomId,
          playerCount: data.playerCount,
        };
        console.log(`✓ Joined room: ${roomId}`);
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  }

  async leaveRoom(roomId) {
    try {
      const response = await fetch(`${this.apiBase}/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        this.currentRoom = null;
        console.log('✓ Left room');
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Leave room error:', error);
      throw error;
    }
  }

  async getRoomStatus(roomId) {
    try {
      const response = await fetch(`${this.apiBase}/rooms/${roomId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
      });

      const data = await response.json();
      if (data.success) return data.room;
      throw new Error(data.error);
    } catch (error) {
      console.error('Get room error:', error);
      throw error;
    }
  }

  async listPublicRooms() {
    try {
      const response = await fetch(`${this.apiBase}/rooms/public`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
      });

      const data = await response.json();
      if (data.success) return data.rooms;
      throw new Error(data.error);
    } catch (error) {
      console.error('List rooms error:', error);
      throw error;
    }
  }

  async startGame(roomId) {
    try {
      const response = await fetch(`${this.apiBase}/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        this.gameState = data.gameState;
        console.log('✓ Game started');
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Start game error:', error);
      throw error;
    }
  }

  // ========== Socket.io ==========
  connectSocket() {
    if (typeof io === 'undefined') {
      console.error('Socket.io not loaded');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: {
        token: this.token,
        userId: this.user._id,
      },
    });

    this.socket.on('connect', () => {
      console.log('✓ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // ========== Events ==========
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Global client instance
window.client = new RegalemClient();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎴 Regalem Client initialized');

  // Check if already logged in
  if (window.client.isAuthenticated()) {
    console.log(`✓ Logged in as: ${window.client.user.username}`);
    window.client.connectSocket();
  }
});