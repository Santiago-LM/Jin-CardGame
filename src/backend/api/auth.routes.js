import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validateAuthInput, validateLoginInput } from '../middleware/validation.middleware.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/auth/register
 */
router.post('/register', validateAuthInput, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log(`[Auth] Registering user: ${username}`);

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (user) {
      return res.status(409).json({
        success: false,
        error: 'User with that email or username already exists',
      });
    }

    // Create new user
    user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    // Save user
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      token,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
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

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: user.toJSON(),
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('[Auth] Verify error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

export default router;