/**
 * Game page initialization
 */

import { GamePage } from './pages/GamePage.js';
import { WebSocketClient } from './services/WebSocketClient.js';
import { GameStateManager } from './state/GameStateManager.js';
import { APIService } from './services/APIService.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check authentication
    const apiService = new APIService();
    const user = await apiService.getCurrentUser();

    if (!user) {
      window.location.href = '/';
      return;
    }

    // Initialize services
    const socket = new WebSocketClient();
    const gameState = new GameStateManager();

    // Get game ID from URL
    const gameId = new URLSearchParams(window.location.search).get('game');
    if (!gameId) {
      window.location.href = '/';
      return;
    }

    // Set initial game state
    gameState.setState({
      gameId,
      playerId: user._id,
      playerName: user.username,
    });

    // Initialize game page
    const gamePage = new GamePage(socket, gameState);
    window.gamePage = gamePage;

    await gamePage.init();
  } catch (error) {
    console.error('Game initialization failed:', error);
    alert('Failed to initialize game. Redirecting...');
    window.location.href = '/';
  }
});