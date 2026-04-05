/**
 * User profile routes
 */

const express = require('express');
const { ProfileService } = require('../services/profileService');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/profile/:userId
 */
router.get('/:userId', async (req, res, next) => {
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
router.put('/:userId', auth, async (req, res, next) => {
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
router.get('/:userId/history', async (req, res, next) => {
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
router.get('/:userId/stats', async (req, res, next) => {
  try {
    const stats = await ProfileService.getStatsByMode(req.params.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;