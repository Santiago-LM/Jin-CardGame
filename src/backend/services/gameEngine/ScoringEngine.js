/**
 * Scoring calculation engine
 */

import { getCardValue } from '../../../shared/cardUtils.js';

export class ScoringEngine {
  /**
   * Calculate score for a round
   * Handles card values, wild cards, and JIN bonuses
   */
  static calculateRound(players) {
    const scores = {};

    players.forEach(player => {
      let roundScore = 0;

      // Add points from played sets (if tracked)
      if (player.setsPlayed && player.setsPlayed.length > 0) {
        player.setsPlayed.forEach(card => {
          roundScore += getCardValue(card);
        });
      }

      // Subtract points from remaining cards in hand
      const remainingPoints = player.hand.reduce((sum, card) => {
        return sum + getCardValue(card);
      }, 0);

      roundScore -= remainingPoints;

      // Handle JIN (play all cards in one turn - double points)
      if (player.hand.length === 0 && player.didJIN) {
        roundScore = this.calculateJINBonus(roundScore);
      }

      // Ensure score doesn't go below 0 for this round
      roundScore = Math.max(roundScore, 0);

      // Update player scores
      player.setRoundScore(roundScore);
      player.addScore(roundScore);

      scores[player.id] = {
        roundScore,
        totalScore: player.totalScore,
        hadJIN: player.didJIN,
      };
    });

    return scores;
  }

  /**
   * Calculate card point value
   * @param {Object} card - Card object with rank and suit
   * @returns {number} Points for the card
   */
  static calculateCardPoints(card) {
    return getCardValue(card);
  }

  /**
   * Calculate total hand value
   * @param {Array} cards - Array of card objects
   * @returns {number} Total point value of all cards
   */
  static calculateHandValue(cards) {
    if (!cards || cards.length === 0) return 0;
    return cards.reduce((sum, card) => sum + getCardValue(card), 0);
  }

  /**
   * Calculate JIN bonus (double the score)
   * @param {number} baseScore - Base round score
   * @returns {number} Doubled score
   */
  static calculateJINBonus(baseScore) {
    return baseScore * 2;
  }

  /**
   * Get leaderboard sorted by total score
   * @param {Array} players - Array of player objects
   * @returns {Array} Sorted leaderboard with rankings
   */
  static getLeaderboard(players) {
    return [...players]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, index) => ({
        rank: index + 1,
        id: player.id,
        name: player.name,
        score: player.totalScore,
        wins: player.wins,
        losses: player.losses,
        winRate: player.getWinRate(),
        gamesPlayed: player.wins + player.losses,
      }));
  }

  /**
   * Get player rank and position
   * @param {Object} player - Player object
   * @param {Array} allPlayers - All players in game
   * @returns {Object} Rank information
   */
  static getPlayerRank(player, allPlayers) {
    const sortedPlayers = this.getLeaderboard(allPlayers);
    const playerRank = sortedPlayers.find(p => p.id === player.id);
    
    return playerRank || {
      rank: sortedPlayers.length + 1,
      id: player.id,
      name: player.name,
      score: player.totalScore,
      wins: player.wins,
      losses: player.losses,
      winRate: player.getWinRate(),
    };
  }

  /**
   * Calculate round statistics
   * @param {Array} players - All players
   * @returns {Object} Round statistics
   */
  static getRoundStatistics(players) {
    const stats = {
      totalPointsDistributed: 0,
      highestScore: 0,
      lowestScore: 0,
      averageScore: 0,
      jinCount: 0,
      playerStats: [],
    };

    players.forEach(player => {
      const playerStat = {
        playerId: player.id,
        playerName: player.name,
        roundScore: player.roundScore,
        handSize: player.hand.length,
        cardsPlayed: player.setsPlayed ? player.setsPlayed.length : 0,
        hadJIN: player.didJIN,
        handValue: this.calculateHandValue(player.hand),
      };

      stats.playerStats.push(playerStat);
      stats.totalPointsDistributed += player.roundScore;

      if (player.roundScore > stats.highestScore) {
        stats.highestScore = player.roundScore;
      }

      if (player.roundScore < stats.lowestScore || stats.lowestScore === 0) {
        stats.lowestScore = player.roundScore;
      }

      if (player.didJIN) {
        stats.jinCount++;
      }
    });

    stats.averageScore = players.length > 0 
      ? Math.round(stats.totalPointsDistributed / players.length) 
      : 0;

    return stats;
  }

  /**
   * Calculate game winner and final standings
   * @param {Array} players - All players
   * @returns {Object} Game result with winner and standings
   */
  static getGameResult(players) {
    const leaderboard = this.getLeaderboard(players);
    const winner = leaderboard[0];

    return {
      winner: {
        id: winner.id,
        name: winner.name,
        finalScore: winner.score,
        wins: winner.wins,
        losses: winner.losses,
        winRate: winner.winRate,
      },
      leaderboard,
      totalRounds: players[0]?.roundsPlayed || 0,
      gameStats: {
        totalPointsEarned: players.reduce((sum, p) => sum + p.totalScore, 0),
        highestIndividualScore: Math.max(...players.map(p => p.totalScore)),
        lowestIndividualScore: Math.min(...players.map(p => p.totalScore)),
        totalJINsPlayed: players.filter(p => p.didJIN).length,
      },
    };
  }

  /**
   * Calculate score adjustment (for rule variations)
   * @param {number} baseScore - Original score
   * @param {string} adjustmentType - Type of adjustment
   * @param {number} multiplier - Multiplier value
   * @returns {number} Adjusted score
   */
  static applyScoreAdjustment(baseScore, adjustmentType, multiplier = 1) {
    switch (adjustmentType) {
      case 'DOUBLE':
        return baseScore * 2;
      case 'HALF':
        return Math.floor(baseScore / 2);
      case 'MULTIPLY':
        return baseScore * multiplier;
      case 'DIVIDE':
        return Math.floor(baseScore / multiplier);
      default:
        return baseScore;
    }
  }

  /**
   * Get win probability based on current scores
   * @param {Array} players - All players
   * @returns {Object} Win probabilities for each player
   */
  static getWinProbabilities(players) {
    const totalScore = players.reduce((sum, p) => sum + p.totalScore, 0);
    
    if (totalScore === 0) {
      // Equal probability if no one has scored yet
      const equalProbability = 1 / players.length;
      return players.reduce((acc, p) => {
        acc[p.id] = equalProbability;
        return acc;
      }, {});
    }

    // Probability based on current score
    const probabilities = players.reduce((acc, p) => {
      acc[p.id] = p.totalScore / totalScore;
      return acc;
    }, {});

    return probabilities;
  }

  /**
   * Calculate MVP (Most Valuable Player) of the round
   * @param {Array} players - All players
   * @returns {Object} MVP info
   */
  static getRoundMVP(players) {
    let mvp = null;
    let highestScore = -Infinity;

    players.forEach(player => {
      if (player.roundScore > highestScore) {
        highestScore = player.roundScore;
        mvp = {
          id: player.id,
          name: player.name,
          score: player.roundScore,
          hadJIN: player.didJIN,
          cardsPlayed: player.setsPlayed ? player.setsPlayed.length : 0,
        };
      }
    });

    return mvp;
  }

  /**
   * Validate score calculation
   * @param {Array} players - All players
   * @param {number} expectedTotal - Expected total points distributed
   * @returns {boolean} Whether calculation is valid
   */
  static validateScores(players, expectedTotal = 0) {
    const actualTotal = players.reduce((sum, p) => sum + p.roundScore, 0);
    
    if (expectedTotal > 0) {
      return actualTotal === expectedTotal;
    }

    // Basic validation: all scores should be non-negative
    return players.every(p => p.roundScore >= 0);
  }

  /**
   * Generate round report
   * @param {Array} players - All players
   * @param {number} roundNumber - Current round number
   * @returns {Object} Detailed round report
   */
  static generateRoundReport(players, roundNumber) {
    const mvp = this.getRoundMVP(players);
    const stats = this.getRoundStatistics(players);
    const leaderboard = this.getLeaderboard(players);

    return {
      roundNumber,
      roundStats: stats,
      mvp,
      leaderboard,
      timestamp: Date.now(),
      summary: {
        totalPointsEarned: stats.totalPointsDistributed,
        avgPointsPerPlayer: stats.averageScore,
        jinCount: stats.jinCount,
        highestIndividualRoundScore: stats.highestScore,
        lowestIndividualRoundScore: stats.lowestScore,
      },
    };
  }
}