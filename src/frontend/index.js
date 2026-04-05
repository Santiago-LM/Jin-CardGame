/**
 * Regalem - Home Page Entry Point
 */

import { APIService } from './services/APIService.js';
import { WebSocketClient } from './services/WebSocketClient.js';
import { GameStateManager } from './state/GameStateManager.js';
import { StorageService } from './services/StorageService.js';
import { HomePage } from './pages/HomePage.js';
import { Logger } from './utils/logger.js';

// Set logging level
Logger.setLevel('INFO');

// Initialize services
const apiService = new APIService();
const socketClient = new WebSocketClient();
const gameStateManager = new GameStateManager();

// Create global app object
window.regalem = {
  api: apiService,
  socket: socketClient,
  state: gameStateManager,
  storage: StorageService,
  logger: Logger,
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  Logger.info('🎴 Regalem Home Page Loading...');
  
  try {
    // Check authentication
    const token = StorageService.load('token');
    const user = StorageService.load('user');
    
    if (token && user) {
      Logger.info(`✓ User authenticated: ${user.username}`);
      apiService.setToken(token);
      socketClient.connect(token);
    }
    
    // Initialize home page
    const homePage = new HomePage(apiService, socketClient, gameStateManager);
    homePage.init();
  } catch (error) {
    Logger.error('Page initialization failed', error);
  }
});