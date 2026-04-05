/**
 * Authentication routes
 */

const express = require('express');
const { AuthService } = require('../services/authService');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await AuthService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await AuthService.getUserByToken(req.token);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    const decoded = AuthService.verifyToken(token);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;