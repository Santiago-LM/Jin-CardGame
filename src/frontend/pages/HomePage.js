/**
 * Home Page Controller
 */

import { Logger } from '../utils/logger.js';

export class HomePage {
  constructor(apiService, socketClient, gameState) {
    this.api = apiService;
    this.socket = socketClient;
    this.gameState = gameState;
    this.currentRoom = null;
    this.matchmakingTimer = null;
    this.roomRefreshInterval = null;
  }

  async init() {
    Logger.info('HomePage initializing...');
    this.setupEventListeners();
    this.checkAuthentication();
    this.startRoomRefresh();
  }

  setupEventListeners() {
    // Auth buttons
    this.on('loginBtn', 'click', () => this.handleLogin());
    this.on('registerBtn', 'click', () => this.handleRegister());
    this.on('logoutBtn', 'click', () => this.handleLogout());

    // Play buttons
    this.on('casualPlayBtn', 'click', () => this.playMode('casual'));
    this.on('rankedPlayBtn', 'click', () => this.playMode('ranked'));

    // Room buttons
    this.on('createRoomBtn', 'click', () => this.showCreateRoomModal());
    this.on('joinRoomBtn', 'click', () => this.showJoinRoomModal());

    // Modal confirms
    this.on('confirmCreateRoom', 'click', () => this.createRoom());
    this.on('confirmJoinRoom', 'click', () => this.joinRoom());

    // Cancel buttons
    this.on('cancelMatchBtn', 'click', () => this.cancelMatchmaking());
    this.on('cancelCreateBtn', 'click', () => this.closeCreateRoomModal());
    this.on('cancelJoinBtn', 'click', () => this.closeJoinRoomModal());
  }

  on(elementId, event, handler) {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener(event, handler.bind(this));
    }
  }

  checkAuthentication() {
    const user = window.regalem.storage.load('user');
    const authSection = document.getElementById('authSection');
    const userSection = document.getElementById('userSection');

    if (user) {
      if (authSection) authSection.style.display = 'none';
      if (userSection) userSection.style.display = 'block';
      const userNameEl = document.getElementById('userName');
      const userRatingEl = document.getElementById('userRating');
      if (userNameEl) userNameEl.textContent = user.username;
      if (userRatingEl) userRatingEl.textContent = user.totalScore || 0;
    } else {
      if (authSection) authSection.style.display = 'block';
      if (userSection) userSection.style.display = 'none';
      this.showAuthModal();
    }
  }

  async handleLogin() {
    const emailEl = document.getElementById('authEmail');
    const passwordEl = document.getElementById('authPassword');
    const email = emailEl?.value.trim();
    const password = passwordEl?.value.trim();

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      Logger.info('Attempting login...');
      const response = await this.api.login(email, password);
      
      window.regalem.storage.save('token', response.token);
      window.regalem.storage.save('user', response.user);
      this.api.setToken(response.token);
      this.socket.connect(response.token);
      
      // Clear form
      if (emailEl) emailEl.value = '';
      if (passwordEl) passwordEl.value = '';
      
      this.closeAuthModal();
      this.checkAuthentication();
      Logger.info(`✓ Logged in as ${response.user.username}`);
    } catch (error) {
      Logger.error('Login failed', error);
      alert(`Login failed: ${error.message}`);
    }
  }

  async handleRegister() {
    const emailEl = document.getElementById('authEmail');
    const passwordEl = document.getElementById('authPassword');
    const email = emailEl?.value.trim();
    const password = passwordEl?.value.trim();
    const username = prompt('Choose a username (3-20 characters):')?.trim();

    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      Logger.info(`Registering user: ${username}`);
      const response = await this.api.register(username, email, password);
      
      window.regalem.storage.save('token', response.token);
      window.regalem.storage.save('user', response.user);
      this.api.setToken(response.token);
      this.socket.connect(response.token);
      
      // Clear form
      if (emailEl) emailEl.value = '';
      if (passwordEl) passwordEl.value = '';
      
      this.closeAuthModal();
      this.checkAuthentication();
      Logger.info(`✓ Registered and logged in as ${response.user.username}`);
    } catch (error) {
      Logger.error('Registration failed', error);
      alert(`Registration failed: ${error.message}`);
    }
  }

  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      window.regalem.storage.clear();
      this.socket.disconnect();
      this.checkAuthentication();
      Logger.info('✓ Logged out');
    }
  }

  async playMode(mode) {
    const user = window.regalem.storage.load('user');
    if (!user) {
      alert('Please login first');
      return;
    }

    this.showMatchmakingModal(mode);
    let seconds = 0;
    
    this.matchmakingTimer = setInterval(() => {
      seconds++;
      this.updateMatchmakingTimer(seconds);

      // Simulate finding match after 3-8 seconds
      if (seconds >= Math.floor(Math.random() * 8) + 3) {
        clearInterval(this.matchmakingTimer);
        this.createAutoRoom(mode);
      }
    }, 1000);
  }

  async createAutoRoom(mode) {
    try {
      Logger.info(`Creating ${mode} room...`);
      const result = await this.api.createRoom({
        mode,
        maxPlayers: 2,
        isPrivate: false,
      });

      this.currentRoom = result.roomId;
      this.closeMatchmakingModal();
      
      Logger.info(`✓ Room created: ${result.roomId}`);
      window.location.href = `/game.html?roomId=${result.roomId}`;
    } catch (error) {
      Logger.error('Failed to create room', error);
      alert(`Error creating room: ${error.message}`);
      this.closeMatchmakingModal();
    }
  }

  showCreateRoomModal() {
    const modal = document.getElementById('createRoomModal');
    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
  }

  closeCreateRoomModal() {
    const modal = document.getElementById('createRoomModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
  }

  async createRoom() {
    const roomNameEl = document.getElementById('roomName');
    const maxPlayersEl = document.getElementById('maxPlayers');
    const gameModeEl = document.getElementById('gameMode');

    const roomName = roomNameEl?.value.trim();
    const maxPlayers = parseInt(maxPlayersEl?.value || '2');
    const gameMode = gameModeEl?.value || 'casual';

    if (!roomName) {
      alert('Please enter a room name');
      return;
    }

    try {
      Logger.info(`Creating room: ${roomName}`);
      const result = await this.api.createRoom({
        mode: gameMode,
        maxPlayers,
        isPrivate: false,
      });

      this.currentRoom = result.roomId;
      alert(`✓ Room created!\nID: ${result.roomId}\n\nShare this ID with friends to join!`);
      
      // Clear form
      if (roomNameEl) roomNameEl.value = '';
      
      this.closeCreateRoomModal();
      this.loadPublicRooms();
      Logger.info(`✓ Room created: ${result.roomId}`);
    } catch (error) {
      Logger.error('Failed to create room', error);
      alert(`Error: ${error.message}`);
    }
  }

  showJoinRoomModal() {
    const modal = document.getElementById('joinRoomModal');
    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
  }

  closeJoinRoomModal() {
    const modal = document.getElementById('joinRoomModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
  }

  async joinRoom() {
    const roomCodeEl = document.getElementById('roomCode');
    const roomId = roomCodeEl?.value.trim();

    if (!roomId) {
      alert('Please enter a room ID');
      return;
    }

    try {
      Logger.info(`Joining room: ${roomId}`);
      const result = await this.api.joinRoom(roomId);
      this.currentRoom = roomId;
      
      Logger.info(`✓ Joined room: ${roomId}`);
      window.location.href = `/game.html?roomId=${roomId}`;
    } catch (error) {
      Logger.error('Failed to join room', error);
      alert(`Error: ${error.message}`);
    }
  }

  startRoomRefresh() {
    this.loadPublicRooms();
    this.roomRefreshInterval = setInterval(() => {
      this.loadPublicRooms();
    }, 5000); // Refresh every 5 seconds
  }

  async loadPublicRooms() {
    try {
      const rooms = await this.api.getPublicRooms();
      this.displayPublicRooms(rooms);
    } catch (error) {
      Logger.error('Failed to load rooms', error);
    }
  }

  displayPublicRooms(rooms) {
    const container = document.getElementById('publicRoomsList');
    if (!container) return;

    if (rooms.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No public rooms available</p>';
      return;
    }

    container.innerHTML = rooms.map(room => `
      <div class="public-room" style="padding: 12px; border: 1px solid #444; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div class="room-info">
          <strong>${room.id}</strong><br>
          <small style="color: #999;">${room.playerCount}/${room.maxPlayers} players • ${room.mode}</small>
        </div>
        <button onclick="window.regalem.pages.joinRoomById('${room.id}')" style="padding: 6px 12px; background: #c9993a; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Join</button>
      </div>
    `).join('');
  }

  showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
  }

  showMatchmakingModal(mode) {
    const modal = document.getElementById('matchmakingModal');
    const modeEl = document.getElementById('mmMode');
    if (modeEl) {
      modeEl.textContent = mode === 'ranked' ? 'Ranked Play' : 'Casual Play';
    }
    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
  }

  closeMatchmakingModal() {
    const modal = document.getElementById('matchmakingModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
    if (this.matchmakingTimer) {
      clearInterval(this.matchmakingTimer);
    }
  }

  cancelMatchmaking() {
    this.closeMatchmakingModal();
  }

  updateMatchmakingTimer(seconds) {
    const timerEl = document.getElementById('mmTimer');
    if (timerEl) {
      const m = Math.floor(seconds / 60);
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }
  }

  destroy() {
    if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
    if (this.roomRefreshInterval) clearInterval(this.roomRefreshInterval);
  }
}

// Add global method for room joining
window.regalem = window.regalem || {};
window.regalem.pages = {
  joinRoomById: async (roomId) => {
    try {
      const result = await window.regalem.api.joinRoom(roomId);
      window.location.href = `/game.html?roomId=${roomId}`;
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
};