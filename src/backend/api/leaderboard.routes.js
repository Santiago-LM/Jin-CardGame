/**
 * Leaderboard routes
 */

const express = require('express');
const { LeaderboardService } = require('../services/leaderboardService');
const { auth } = require('../middleware/auth.middleware');

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

module.exports = router;