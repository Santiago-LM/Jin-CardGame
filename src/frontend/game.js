/**
 * Game page initialization
 */

import { GamePage } from './pages/GamePage.js';
import { WebSocketClient } from './services/WebSocketClient.js';
import { GameStateManager } from './state/GameStateManager.js';
import { APIService } from './services/APIService.js';
import { Logger } from './utils/logger.js';

Logger.setLevel('INFO');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    Logger.info('🎴 Game Page Loading...');

    // Check authentication
    const token = window.regalem?.storage.load('token');
    const user = window.regalem?.storage.load('user');

    if (!token || !user) {
      window.location.href = '/';
      return;
    }

    // Initialize services
    const apiService = new APIService();
    apiService.setToken(token);
    
    const socketClient = new WebSocketClient();
    const gameState = new GameStateManager();

    // Initialize game page
    const gamePage = new GamePage(socketClient, gameState, apiService);
    window.gamePage = gamePage;

    await gamePage.init();
  } catch (error) {
    Logger.error('Game initialization failed', error);
    alert('Failed to initialize game. Redirecting...');
    window.location.href = '/';
  }
});