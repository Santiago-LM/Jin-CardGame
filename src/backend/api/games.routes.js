/**
 * Game state and moves routes
 */

const express = require('express');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/games/:gameId/state
 */
router.get('/:gameId/state', auth, (req, res, next) => {
  try {
    // Get game state from room service (via socket)
    res.json({ message: 'Use WebSocket for real-time game state' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/games/:gameId/history
 */
router.get('/:gameId/history', auth, (req, res, next) => {
  try {
    res.json({ message: 'Game history endpoint' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;