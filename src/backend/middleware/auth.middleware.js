/**
 * Authentication middleware
 */

const { AuthService } = require('../services/authService');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = AuthService.verifyToken(token);
    req.userId = decoded.userId;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { auth };