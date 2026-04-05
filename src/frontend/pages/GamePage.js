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
import { Logger } from '../utils/logger.js';

export class GamePage {
  constructor(webSocketClient, gameStateManager, apiService) {
    this.socket = webSocketClient;
    this.gameState = gameStateManager;
    this.api = apiService;
    this.components = {};
    this.unsubscribers = [];
    this.inactivityTimer = null;
  }

  /**
   * Initialize game page
   */
  async init() {
    Logger.info('Initializing GamePage...');

    try {
      // Get room ID from URL
      const roomId = new URLSearchParams(window.location.search).get('roomId');
      if (!roomId) {
        window.location.href = '/';
        return;
      }

      // Get user info
      const user = window.regalem.storage.load('user');
      if (!user) {
        window.location.href = '/';
        return;
      }

      // Update state with room and player info
      this.gameState.setState({
        gameId: roomId,
        playerId: user._id,
        playerName: user.username,
      });

      // Initialize components
      this.initializeComponents();

      // Setup socket listeners
      this.setupSocketListeners();

      // Setup inactivity timer
      this.setupInactivityTimer();

      // Request initial game state
      const state = await this.socket.getGameState();
      this.gameState.setState(state);

      Logger.info('GamePage initialized successfully');
    } catch (error) {
      Logger.error('GamePage initialization failed', error);
      alert('Failed to load game');
      window.location.href = '/';
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

    Logger.info('All components initialized');
  }

  /**
   * Setup WebSocket event listeners
   */
  setupSocketListeners() {
    this.unsubscribers.push(
      this.socket.on('gameStateUpdated', (state) => {
        this.gameState.setState(state);
      })
    );

    this.unsubscribers.push(
      this.socket.on('moveApplied', (moveData) => {
        this.handleMoveApplied(moveData);
      })
    );

    this.unsubscribers.push(
      this.socket.on('moveRejected', (rejectData) => {
        this.handleMoveRejected(rejectData);
      })
    );

    this.unsubscribers.push(
      this.socket.on('roundEnd', (roundData) => {
        this.handleRoundEnd(roundData);
      })
    );

    this.unsubscribers.push(
      this.socket.on('jinPlayed', (data) => {
        this.handleJINPlayed(data);
      })
    );

    this.unsubscribers.push(
      this.socket.on('playerDisconnected', (playerData) => {
        this.handlePlayerDisconnect(playerData);
      })
    );

    this.unsubscribers.push(
      this.socket.on('playerReconnected', (playerData) => {
        this.handlePlayerReconnect(playerData);
      })
    );

    this.unsubscribers.push(
      this.socket.on('playerKicked', (data) => {
        this.handlePlayerKicked(data);
      })
    );

    this.unsubscribers.push(
      this.socket.on('error', (error) => {
        this.gameState.setError(error.message);
      })
    );

    Logger.info('Socket listeners setup');
  }

  /**
   * Setup inactivity timer (3 minutes)
   */
  setupInactivityTimer() {
    const INACTIVITY_WARNING_TIME = 2.5 * 60 * 1000;
    const INACTIVITY_KICK_TIME = 3 * 60 * 1000;

    const resetTimer = () => {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }

      this.inactivityTimer = setTimeout(() => {
        this.gameState.setState({ inactivityWarning: true });
        Logger.warn('Inactivity warning triggered');

        setTimeout(() => {
          Logger.info('Player kicked due to inactivity');
          this.destroy();
          window.location.href = '/';
        }, INACTIVITY_KICK_TIME - INACTIVITY_WARNING_TIME);
      }, INACTIVITY_WARNING_TIME);
    };

    document.addEventListener('click', () => resetTimer());
    document.addEventListener('keydown', () => resetTimer());

    resetTimer();
  }

  handleMoveApplied(moveData) {
    Logger.info('Move applied:', moveData);
    this.gameState.setMoveInProgress(false);
    this.gameState.clearSelectedCards();
    this.gameState.clearSelectedPileIndices();
  }

  handleMoveRejected(rejectData) {
    Logger.warn('Move rejected:', rejectData.reason);
    this.gameState.setMoveInProgress(false);
    this.gameState.setError(rejectData.reason);
  }

  handleRoundEnd(roundData) {
    Logger.info('Round ended:', roundData);
    const scoreboardEl = document.getElementById('scoreboardModal');
    if (scoreboardEl) {
      const scoreboard = new ScoreBoardModal(scoreboardEl, roundData.scores);
      scoreboard.show();
    }
  }

  handleJINPlayed(data) {
    Logger.info('JIN played:', data);
    const jinEl = document.getElementById('jinAnimation');
    if (jinEl) {
      const jinAnim = new JINAnimation(jinEl);
      jinAnim.play();
    }
  }

  handlePlayerDisconnect(playerData) {
    Logger.warn('Player disconnected:', playerData);
    this.gameState.setError(`${playerData.playerName} disconnected`);
  }

  handlePlayerReconnect(playerData) {
    Logger.info('Player reconnected:', playerData);
    this.gameState.clearError();
  }

  handlePlayerKicked(data) {
    Logger.info('Player kicked:', data.reason);
    alert(`You have been removed from the game: ${data.reason}`);
    this.destroy();
    window.location.href = '/';
  }

  destroy() {
    Logger.info('Destroying GamePage...');

    this.unsubscribers.forEach(unsub => unsub());

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

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