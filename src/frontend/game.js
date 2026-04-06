/**
 * Regalem — Game Page Entry Point
 */

import { StorageService } from './services/StorageService.js';
import { APIService } from './services/APIService.js';
import { WebSocketClient } from './services/WebSocketClient.js';
import { GameStateManager } from './state/GameStateManager.js';
import { GamePage } from './pages/GamePage.js';
import { Logger } from './utils/logger.js';

Logger.setLevel('INFO');

document.addEventListener('DOMContentLoaded', async () => {
  Logger.info('🎴 Regalem Game Page Loading...');

  try {
    const token = StorageService.getToken();
    const user = StorageService.getUser();

    if (!token || !user) {
      Logger.warn('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }

    // Initialize services
    const apiService = new APIService();
    apiService.setToken(token);

    const socketClient = new WebSocketClient();
    const gameState = new GameStateManager();

    // Expose for debugging and cross-component use
    window.regalem = {
      api: apiService,
      socket: socketClient,
      state: gameState,
      storage: StorageService,
      logger: Logger,
    };

    // Initialize game page controller
    const gamePage = new GamePage(socketClient, gameState, apiService);
    window.gamePage = gamePage;

    socketClient.connect(token);
    await gamePage.init();

    Logger.info('✓ Game page initialized');
  } catch (error) {
    Logger.error('Game initialization failed', error);
    alert('Failed to initialize game. Redirecting...');
    window.location.href = '/';
  }
});