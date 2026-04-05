import express from 'express';
import { ProfileService } from '../services/profileService.js';
import { auth } from '../middleware/auth.middleware.js';
import { validateUserId, validateProfileUpdate } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * GET /api/profile/:userId
 */
router.get('/:userId', validateUserId, async (req, res, next) => {
  try {
    const profile = await ProfileService.getUserProfile(req.params.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/profile/:userId
 */
router.put('/:userId', auth, validateUserId, validateProfileUpdate, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await ProfileService.updateProfile(req.userId, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/:userId/history
 */
router.get('/:userId/history', validateUserId, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await ProfileService.getGameHistory(req.params.userId, limit);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/:userId/stats
 */
router.get('/:userId/stats', validateUserId, async (req, res, next) => {
  try {
    const stats = await ProfileService.getStatsByMode(req.params.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;