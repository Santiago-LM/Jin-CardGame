import express from 'express';
import { AuthService } from '../services/authService.js';
import { User } from '../models/User.js';
import { validateAuthInput, validateLoginInput } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', validateAuthInput, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log(`[Auth] Registering user: ${username}`);

    const result = await AuthService.register(username, email, password);

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Registration successful',
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', validateLoginInput, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth] Login attempt: ${email}`);

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;