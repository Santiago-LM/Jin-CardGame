/**
 * Home page logic (already exists, integrating with new architecture)
 */

import { APIService } from '../services/APIService.js';
import { StorageService } from '../services/StorageService.js';
import { WebSocketClient } from '../services/WebSocketClient.js';

export class HomePage {
  constructor() {
    this.apiService = new APIService();
    this.socket = new WebSocketClient();
  }

  /**
   * Initialize home page
   */
  async init() {
    console.log('Initializing HomePage...');

    try {
      // Check if user is logged in
      const token = StorageService.load('token');
      if (!token) {
        // Show login/register UI
        this.showAuthUI();
        return;
      }

      // Load user profile
      const user = await this.apiService.getCurrentUser();
      this.setupHomePage(user);
    } catch (error) {
      console.error('Home page initialization failed:', error);
      this.showAuthUI();
    }
  }

  /**
   * Show authentication UI
   */
  showAuthUI() {
    const container = document.getElementById('main');
    if (container) {
      container.innerHTML = `
        <div class="auth-container">
          <h1>Welcome to Regalem</h1>
          <p>Sign in to play GYN card game</p>
          <button onclick="showLoginForm()" class="btn-primary">Login</button>
          <button onclick="showRegisterForm()" class="btn-secondary">Register</button>
        </div>
      `;
    }
  }

  /**
   * Setup home page for authenticated user
   */
  setupHomePage(user) {
    console.log('Setting up home page for user:', user.username);

    // Update existing home page with user data
    const profileName = document.querySelector('.profile-username');
    if (profileName) {
      profileName.textContent = user.username;
    }

    // Load leaderboard
    this.loadLeaderboard();

    // Load live games
    this.loadLiveGames();

    // Setup event listeners for existing buttons
    this.setupEventListeners();
  }

  /**
   * Load leaderboard data
   */
  async loadLeaderboard() {
    try {
      const leaderboard = await this.apiService.getGlobalLeaderboard(10);
      // Update leaderboard UI
      console.log('Leaderboard:', leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }

  /**
   * Load live games
   */
  async loadLiveGames() {
    try {
      // Setup socket listener for live games
      this.socket.on('gameStateUpdated', (gameState) => {
        console.log('Game state updated:', gameState);
      });
    } catch (error) {
      console.error('Failed to load live games:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Existing home page buttons
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const rankedBtn = document.querySelector('[data-mode="ranked"] .btn-play');
    const casualBtn = document.querySelector('[data-mode="casual"] .btn-play');

    if (rankedBtn) {
      rankedBtn.addEventListener('click', () => this.findMatch('ranked'));
    }

    if (casualBtn) {
      casualBtn.addEventListener('click', () => this.findMatch('casual'));
    }

    if (createRoomBtn) {
      createRoomBtn.addEventListener('click', () => this.openCreateRoomModal());
    }

    if (joinRoomBtn) {
      joinRoomBtn.addEventListener('click', () => this.openJoinRoomModal());
    }
  }

  /**
   * Find match
   */
  async findMatch(mode) {
    try {
      // Create game
      const room = await this.apiService.createRoom({
        mode,
        maxPlayers: 2,
      });

      // Redirect to game
      window.location.href = `/game.html?game=${room.roomId}`;
    } catch (error) {
      console.error('Failed to find match:', error);
      alert('Failed to create game');
    }
  }

  /**
   * Open create room modal
   */
  openCreateRoomModal() {
    const modal = document.getElementById('createRoomModal');
    if (modal) {
      modal.classList.add('open');
    }
  }

  /**
   * Open join room modal
   */
  openJoinRoomModal() {
    const modal = document.getElementById('joinRoomModal');
    if (modal) {
      modal.classList.add('open');
    }
  }
}