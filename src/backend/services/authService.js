/**
 * Authentication service
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { JWT_SECRET } = require('../config/env');

class AuthService {
  /**
   * Register user
   */
  static async register(username, email, password) {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();
    const token = this.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    const user = await User.findOne({ email });

    if (!user || !user.comparePassword(password)) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Verify token
   */
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Get user by token
   */
  static async getUserByToken(token) {
    const decoded = this.verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = { AuthService };