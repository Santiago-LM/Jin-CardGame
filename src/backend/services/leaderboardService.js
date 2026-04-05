/**
 * Leaderboard and statistics service
 */

import { User } from '../models/User.js';
import { GameRecord } from '../models/GameRecord.js';

export class LeaderboardService {
  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(limit = 100) {
    const users = await User.find()
      .select('username totalScore wins losses')
      .sort({ totalScore: -1 })
      .limit(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      totalScore: user.totalScore,
      wins: user.wins,
      losses: user.losses,
      winRate: user.wins + user.losses === 0 ? 0 : Math.round((user.wins / (user.wins + user.losses)) * 100),
    }));
  }

  /**
   * Get leaderboard by game mode
   */
  static async getLeaderboardByMode(mode = 'casual', limit = 100) {
    const leaderboard = await GameRecord.aggregate([
      { $match: { gameMode: mode } },
      {
        $group: {
          _id: '$winnerId',
          wins: { $sum: 1 },
          totalScore: { $sum: '$winnerScore' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'playerInfo',
        },
      },
    ]);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      username: entry.playerInfo[0]?.username || 'Unknown',
      wins: entry.wins,
      totalScore: entry.totalScore,
    }));
  }

  /**
   * Get user rank
   */
  static async getUserRank(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const usersAhead = await User.countDocuments({
      totalScore: { $gt: user.totalScore },
    });

    return {
      userId: user._id,
      username: user.username,
      rank: usersAhead + 1,
      score: user.totalScore,
      wins: user.wins,
      losses: user.losses,
    };
  }

  /**
   * Update user stats
   */
  static async updateUserStats(userId, gameResult) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (gameResult.isWinner) {
      user.wins += 1;
      user.totalScore += gameResult.score;
    } else {
      user.losses += 1;
      user.totalScore += gameResult.score;
    }

    await user.save();

    return user;
  }

  /**
   * Get player statistics
   */
  static async getPlayerStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const games = await GameRecord.find({
      $or: [
        { winnerId: userId },
        { loserIds: userId },
      ],
    }).limit(100);

    const totalGames = games.length;
    const wonGames = games.filter(g => g.winnerId.toString() === userId.toString()).length;
    const avgScore = games.length > 0 ? Math.round(games.reduce((sum, g) => sum + g.winnerScore, 0) / games.length) : 0;

    return {
      userId,
      username: user.username,
      totalScore: user.totalScore,
      totalGames,
      wins: wonGames,
      losses: totalGames - wonGames,
      winRate: totalGames > 0 ? Math.round((wonGames / totalGames) * 100) : 0,
      averageScore: avgScore,
    };
  }
}