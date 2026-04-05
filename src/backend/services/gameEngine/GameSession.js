/**
 * Manages a single game session/room
 */

import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player.js';
import { GameRound } from './GameRound.js';
import { ScoringEngine } from './ScoringEngine.js';
import { GAME_RULES, GAME_STATUS } from '../../../shared/constants.js';

export class GameSession {
  constructor(gameId, playerIds, playerNames = {}, gameMode = 'casual') {
    this.gameId = gameId;
    this.gameMode = gameMode;
    this.players = playerIds.map(id => new Player(id, playerNames[id] || `Player ${id}`));
    this.spectators = [];
    this.currentRound = null;
    this.gameHistory = [];
    this.status = GAME_STATUS.SETUP;
    this.startTime = null;
    this.disconnectedPlayers = new Map();
    this.pausedAt = null;
  }

  /**
   * Initialize and start the game
   */
  startGame() {
    if (this.players.length < GAME_RULES.MIN_PLAYERS) {
      throw new Error(`Minimum ${GAME_RULES.MIN_PLAYERS} players required`);
    }

    this.status = GAME_STATUS.IN_PROGRESS;
    this.startTime = Date.now();
    this.startRound();
  }

  /**
   * Start a new round
   */
  startRound() {
    // Reset player round scores
    this.players.forEach(p => p.resetRoundScore());

    // Create new round
    this.currentRound = new GameRound(this.players, this.gameHistory.length + 1);
    this.currentRound.start();

    this.status = GAME_STATUS.IN_PROGRESS;
  }

  /**
   * Process a player move
   */
  processMove(playerId, moveData) {
    if (this.status !== GAME_STATUS.IN_PROGRESS) {
      throw new Error('Game is not in progress');
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const currentPlayer = this.currentRound.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    // Apply move
    this.currentRound.applyMove(player, moveData);

    // Check if round ended
    if (this.currentRound.isEnded()) {
      return this.endRound();
    }

    return {
      success: true,
      gameState: this.getGameState(),
    };
  }

  /**
   * End current round
   */
  endRound() {
    const scores = ScoringEngine.calculateRound(this.players);

    this.gameHistory.push({
      round: this.currentRound.roundNumber,
      scores,
      moves: this.currentRound.moveHistory,
      timestamp: Date.now(),
    });

    // Check if game ended
    if (this.isGameEnded()) {
      return this.endGame();
    }

    // Continue to next round
    this.startRound();

    return {
      success: true,
      roundEnded: true,
      gameState: this.getGameState(),
    };
  }

  /**
   * End game
   */
  endGame() {
    this.status = GAME_STATUS.GAME_END;
    const winner = this.getWinner();
    const leaderboard = ScoringEngine.getLeaderboard(this.players);

    // Record wins/losses
    winner.recordWin();
    this.players.forEach(p => {
      if (p.id !== winner.id) {
        p.recordLoss();
      }
    });

    return {
      success: true,
      gameEnded: true,
      winner,
      leaderboard,
      finalScores: this.getScores(),
      gameState: this.getGameState(),
    };
  }

  /**
   * Check if game should end (any player at 1000+ points)
   */
  isGameEnded() {
    return this.players.some(p => p.totalScore >= GAME_RULES.WINNING_SCORE);
  }

  /**
   * Get winner (first to 1000 points)
   */
  getWinner() {
    const winner = this.players.reduce((a, b) =>
      a.totalScore > b.totalScore ? a : b
    );
    return winner;
  }

  /**
   * Get current game state for broadcast (no private hands for spectators)
   */
  getGameState(forSpectator = false) {
    const playerStates = this.players.map(p => 
      forSpectator ? p.getPublicState() : p.getPrivateState()
    );

    return {
      gameId: this.gameId,
      gameMode: this.gameMode,
      status: this.status,
      currentPlayerIndex: this.currentRound?.currentPlayerIndex || 0,
      currentPlayerId: this.currentRound?.getCurrentPlayer()?.id || null,
      players: playerStates,
      communityPile: this.currentRound?.communityPile.getCards() || [],
      deckSize: this.currentRound?.deck.getRemainingCount() || 0,
      round: this.currentRound?.roundNumber || 0,
      scores: this.getScores(),
      spectatorCount: this.spectators.length,
    };
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Get all scores
   */
  getScores() {
    return this.players.reduce((acc, p) => {
      acc[p.id] = {
        name: p.name,
        totalScore: p.totalScore,
        roundScore: p.roundScore,
      };
      return acc;
    }, {});
  }

  /**
   * Handle player disconnect
   */
  handleDisconnect(playerId) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.setActive(false);
      this.disconnectedPlayers.set(playerId, Date.now());
    }
  }

  /**
   * Handle player reconnect
   */
  handleReconnect(playerId) {
    const player = this.getPlayer(playerId);
    if (player) {
      player.setActive(true);
      this.disconnectedPlayers.delete(playerId);
    }
  }

  /**
   * Check for inactive players (3 min timeout)
   */
  checkInactivity(timeoutMs = GAME_RULES.INACTIVITY_TIMEOUT) {
    const now = Date.now();
    const playersToRemove = [];

    this.disconnectedPlayers.forEach((disconnectTime, playerId) => {
      if (now - disconnectTime > timeoutMs) {
        playersToRemove.push(playerId);
      }
    });

    playersToRemove.forEach(playerId => {
      this.removePlayer(playerId);
    });

    return playersToRemove;
  }

  /**
   * Remove player from game
   */
  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const removedPlayer = this.players[playerIndex];

    // If this was the current player, skip their turn
    if (this.currentRound && this.currentRound.currentPlayerIndex === playerIndex) {
      this.currentRound.advanceToNextPlayer();
    }

    // Remove player
    this.players.splice(playerIndex, 1);

    // Check if game should end
    if (this.players.length < GAME_RULES.MIN_PLAYERS) {
      this.status = GAME_STATUS.PAUSED;
    }

    return removedPlayer;
  }

  /**
   * Add spectator
   */
  addSpectator(spectatorId) {
    if (!this.spectators.find(s => s.id === spectatorId)) {
      this.spectators.push({
        id: spectatorId,
        joinedAt: Date.now(),
      });
    }
  }

  /**
   * Remove spectator
   */
  removeSpectator(spectatorId) {
    this.spectators = this.spectators.filter(s => s.id !== spectatorId);
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return {
      gameId: this.gameId,
      gameMode: this.gameMode,
      status: this.status,
      playerCount: this.players.length,
      spectatorCount: this.spectators.length,
      currentRound: this.currentRound?.roundNumber || 0,
      startTime: this.startTime,
      duration: this.startTime ? Date.now() - this.startTime : 0,
    };
  }
}