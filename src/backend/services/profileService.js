/**
 * User profile service
 */

const { User } = require('../models/User');
const { GameRecord } = require('../models/GameRecord');

class ProfileService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get recent games
    const recentGames = await GameRecord.find({
      $or: [
        { winnerId: userId },
        { loserIds: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      totalScore: user.totalScore,
      wins: user.wins,
      losses: user.losses,
      winRate: user.wins + user.losses === 0 ? 0 : Math.round((user.wins / (user.wins + user.losses)) * 100),
      recentGames: recentGames.map(game => ({
        gameId: game._id,
        mode: game.gameMode,
        result: game.winnerId.toString() === userId.toString() ? 'win' : 'loss',
        score: game.winnerScore,
        playedAt: game.createdAt,
      })),
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allowedFields = ['avatar', 'bio'];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    return user;
  }

  /**
   * Get game history
   */
  static async getGameHistory(userId, limit = 50) {
    const games = await GameRecord.find({
      $or: [
        { winnerId: userId },
        { loserIds: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return games.map(game => ({
      gameId: game._id,
      gameMode: game.gameMode,
      isWin: game.winnerId.toString() === userId.toString(),
      score: game.winnerScore,
      opponents: game.loserIds.map(id => id.toString() === userId.toString() ? game.winnerId : id),
      playedAt: game.createdAt,
      duration: game.duration,
    }));
  }

  /**
   * Get win/loss stats by mode
   */
  static async getStatsByMode(userId) {
    const games = await GameRecord.find({
      $or: [
        { winnerId: userId },
        { loserIds: userId },
      ],
    });

    const statsByMode = {};

    games.forEach(game => {
      if (!statsByMode[game.gameMode]) {
        statsByMode[game.gameMode] = { wins: 0, losses: 0, totalScore: 0, gameCount: 0 };
      }

      if (game.winnerId.toString() === userId.toString()) {
        statsByMode[game.gameMode].wins += 1;
        statsByMode[game.gameMode].totalScore += game.winnerScore;
      } else {
        statsByMode[game.gameMode].losses += 1;
      }

      statsByMode[game.gameMode].gameCount += 1;
    });

    Object.keys(statsByMode).forEach(mode => {
      const stats = statsByMode[mode];
      stats.winRate = stats.gameCount > 0 ? Math.round((stats.wins / stats.gameCount) * 100) : 0;
      stats.averageScore = stats.gameCount > 0 ? Math.round(stats.totalScore / stats.gameCount) : 0;
    });

    return statsByMode;
  }
}

module.exports = { ProfileService };