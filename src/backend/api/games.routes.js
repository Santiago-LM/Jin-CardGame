import express from 'express';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/games/:gameId/state
 */
router.get('/:gameId/state', auth, (req, res, next) => {
  try {
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

export default router;