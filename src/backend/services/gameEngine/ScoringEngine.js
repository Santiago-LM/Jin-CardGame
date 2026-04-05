/**
 * Scoring calculation
 */

const { getCardValue } = require('../../../shared/cardUtils');

class ScoringEngine {
  /**
   * Calculate score for a round
   */
  static calculateRound(players) {
    const scores = {};

    players.forEach(player => {
      let roundScore = 0;

      // Add points from played sets (if tracked)
      if (player.setsPlayed) {
        player.setsPlayed.forEach(set => {
          set.forEach(card => {
            roundScore += getCardValue(card);
          });
        });
      }

      // Subtract points from remaining cards
      const remainingPoints = player.hand.reduce((sum, card) => {
        return sum + getCardValue(card);
      }, 0);

      roundScore -= remainingPoints;

      // Handle JIN (double points)
      if (player.hand.length === 0 && player.didJIN) {
        roundScore *= 2;
      }

      player.setRoundScore(roundScore);
      player.addScore(roundScore);

      scores[player.id] = roundScore;
    });

    return scores;
  }

  /**
   * Calculate card points
   */
  static calculateCardPoints(card) {
    return getCardValue(card);
  }

  /**
   * Calculate hand value
   */
  static calculateHandValue(cards) {
    return cards.reduce((sum, card) => sum + getCardValue(card), 0);
  }

  /**
   * Get leaderboard scores
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
      }));
  }
}

module.exports = { ScoringEngine };