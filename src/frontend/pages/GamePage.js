/**
 * Game page controller - orchestrates all game components
 */

import { GameTable } from '../components/GameTable.js';
import { PlayerHUD } from '../components/PlayerHUD.js';
import { PlayerHand } from '../components/PlayerHand.js';
import { CommunityPile } from '../components/CommunityPile.js';
import { ActionPanel } from '../components/ActionPanel.js';
import { RoundInfo } from '../components/RoundInfo.js';
import { ScoreBoardModal } from '../components/ScoreBoardModal.js';
import { JINAnimation } from '../components/JINAnimation.js';

export class GamePage {
  constructor(webSocketClient, gameStateManager) {
    this.socket = webSocketClient;
    this.gameState = gameStateManager;
    this.components = {};
    this.unsubscribers = [];
    this.inactivityTimer = null;
  }

  /**
   * Initialize game page
   */
  async init() {
    console.log('Initializing GamePage...');

    // Setup state subscription
    this.unsubscribers.push(
      this.gameState.subscribe((state) => this.onStateChange(state))
    );

    // Initialize components
    this.initializeComponents();

    // Setup socket listeners
    this.setupSocketListeners();

    // Setup inactivity timer
    this.setupInactivityTimer();

    // Request initial game state
    try {
      const state = await this.socket.getGameState();
      this.gameState.setState(state);
    } catch (error) {
      console.error('Failed to load game:', error);
      this.gameState.setError('Failed to load game state');
    }
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    const gameTableEl = document.getElementById('gameTable');
    const playerHUDEl = document.getElementById('playerHUD');
    const playerHandEl = document.getElementById('playerHand');
    const communityPileEl = document.getElementById('communityPile');
    const actionsEl = document.getElementById('actions');
    const roundInfoEl = document.getElementById('roundInfo');

    if (gameTableEl) {
      this.components.table = new GameTable(gameTableEl, this.gameState, this.socket);
    }

    if (playerHUDEl) {
      this.components.playerHUD = new PlayerHUD(playerHUDEl, this.gameState);
    }

    if (playerHandEl) {
      this.components.hand = new PlayerHand(playerHandEl, this.gameState, this.socket);
    }

    if (communityPileEl) {
      this.components.communityPile = new CommunityPile(communityPileEl, this.gameState, this.socket);
    }

    if (actionsEl) {
      this.components.actions = new ActionPanel(actionsEl, this.gameState, this.socket);
    }

    if (roundInfoEl) {
      this.components.roundInfo = new RoundInfo(roundInfoEl, this.gameState);
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  setupSocketListeners() {
    // Game state updates
    this.unsubscribers.push(
      this.socket.on('gameStateUpdated', (state) => {
        this.gameState.setState(state);
      })
    );

    // Move applied
    this.unsubscribers.push(
      this.socket.on('moveApplied', (moveData) => {
        this.handleMoveApplied(moveData);
      })
    );

    // Move rejected
    this.unsubscribers.push(
      this.socket.on('moveRejected', (rejectData) => {
        this.handleMoveRejected(rejectData);
      })
    );

    // Round end
    this.unsubscribers.push(
      this.socket.on('roundEnd', (roundData) => {
        this.handleRoundEnd(roundData);
      })
    );

    // JIN played
    this.unsubscribers.push(
      this.socket.on('jinPlayed', (data) => {
        this.handleJINPlayed(data);
      })
    );

    // Player disconnected
    this.unsubscribers.push(
      this.socket.on('playerDisconnected', (playerData) => {
        this.handlePlayerDisconnect(playerData);
      })
    );

    // Player reconnected
    this.unsubscribers.push(
      this.socket.on('playerReconnected', (playerData) => {
        this.handlePlayerReconnect(playerData);
      })
    );

    // Player kicked
    this.unsubscribers.push(
      this.socket.on('playerKicked', (data) => {
        this.handlePlayerKicked(data);
      })
    );

    // Error
    this.unsubscribers.push(
      this.socket.on('error', (error) => {
        this.gameState.setError(error.message);
      })
    );
  }

  /**
   * Setup inactivity timer (3 minutes)
   */
  setupInactivityTimer() {
    const INACTIVITY_WARNING_TIME = 2.5 * 60 * 1000; // 2.5 minutes
    const INACTIVITY_KICK_TIME = 3 * 60 * 1000; // 3 minutes

    this.resetInactivityTimer = () => {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }

      this.inactivityTimer = setTimeout(() => {
        this.gameState.setState({ inactivityWarning: true });

        setTimeout(() => {
          console.log('Player kicked due to inactivity');
          this.destroy();
          window.location.href = '/';
        }, INACTIVITY_KICK_TIME - INACTIVITY_WARNING_TIME);
      }, INACTIVITY_WARNING_TIME);
    };

    // Reset on any user activity
    document.addEventListener('click', () => this.resetInactivityTimer());
    document.addEventListener('keydown', () => this.resetInactivityTimer());

    this.resetInactivityTimer();
  }

  /**
   * Handle state change
   */
  onStateChange(state) {
    // Components automatically update via their own subscriptions
  }

  /**
   * Handle successful move
   */
  handleMoveApplied(moveData) {
    console.log('Move applied:', moveData);
    this.gameState.setMoveInProgress(false);
    this.gameState.clearSelectedCards();
    this.gameState.clearSelectedPileIndices();
  }

  /**
   * Handle rejected move
   */
  handleMoveRejected(rejectData) {
    console.warn('Move rejected:', rejectData.reason);
    this.gameState.setMoveInProgress(false);
    this.gameState.setError(rejectData.reason);

    // Shake animation on hand
    const handEl = document.getElementById('playerHand');
    if (handEl) {
      handEl.classList.add('shake');
      setTimeout(() => handEl.classList.remove('shake'), 400);
    }
  }

  /**
   * Handle round end
   */
  handleRoundEnd(roundData) {
    console.log('Round ended:', roundData);

    // Show scoreboard modal
    const scoreboardEl = document.getElementById('scoreboardModal');
    if (scoreboardEl) {
      const scoreboard = new ScoreBoardModal(scoreboardEl, roundData.scores);
      scoreboard.show();

      setTimeout(() => {
        scoreboard.hide();
      }, 5000);
    }
  }

  /**
   * Handle JIN played
   */
  handleJINPlayed(data) {
    console.log('JIN played:', data);

    // Show JIN animation
    const jinEl = document.getElementById('jinAnimation');
    if (jinEl) {
      const jinAnim = new JINAnimation(jinEl);
      jinAnim.play();
    }

    // Play sound
    if (this.components.soundService) {
      this.components.soundService.playJIN();
    }
  }

  /**
   * Handle player disconnect
   */
  handlePlayerDisconnect(playerData) {
    console.warn('Player disconnected:', playerData.playerId);
    this.gameState.setError(`${playerData.playerName} disconnected`);
  }

  /**
   * Handle player reconnect
   */
  handlePlayerReconnect(playerData) {
    console.log('Player reconnected:', playerData.playerId);
    this.gameState.clearError();
  }

  /**
   * Handle player kicked
   */
  handlePlayerKicked(data) {
    console.log('Player kicked:', data.reason);
    alert(`You have been removed from the game: ${data.reason}`);
    this.destroy();
    window.location.href = '/';
  }

  /**
   * Cleanup on page unload
   */
  destroy() {
    console.log('Destroying GamePage...');

    // Unsubscribe from all events
    this.unsubscribers.forEach(unsub => unsub());

    // Cleanup inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Cleanup components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    // Leave game
    if (this.gameState.state.gameId && this.gameState.state.playerId) {
      this.socket.leaveGame(
        this.gameState.state.gameId,
        this.gameState.state.playerId
      );
    }
  }
}

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.gamePage) {
    window.gamePage.destroy();
  }
});