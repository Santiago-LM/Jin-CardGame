import express from 'express';
import { LeaderboardService } from '../services/leaderboardService.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/leaderboard/global
 */
router.get('/global', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await LeaderboardService.getGlobalLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboard/:gameMode
 */
router.get('/:gameMode', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await LeaderboardService.getLeaderboardByMode(
      req.params.gameMode,
      limit
    );
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaderboard/rank/:userId
 */
router.get('/rank/:userId', async (req, res, next) => {
  try {
    const rank = await LeaderboardService.getUserRank(req.params.userId);
    res.json(rank);
  } catch (error) {
    next(error);
  }
});

export default router;