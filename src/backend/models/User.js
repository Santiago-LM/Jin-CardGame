/**
 * User database model
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    index: true,  // Keep only ONE
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    index: true,  // Keep only ONE
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  wins: {
    type: Number,
    default: 0,
    min: 0,
  },
  losses: {
    type: Number,
    default: 0,
    min: 0,
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Remove the .index() calls - they're duplicates
// Just use index: true in the schema definition above

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Get user stats
userSchema.methods.getStats = function () {
  const total = this.wins + this.losses;
  const winRate = total === 0 ? 0 : Math.round((this.wins / total) * 100);
  
  return {
    totalScore: this.totalScore,
    wins: this.wins,
    losses: this.losses,
    totalGames: total,
    winRate,
  };
};

// JSON representation (exclude password)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Public profile
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    totalScore: this.totalScore,
    wins: this.wins,
    losses: this.losses,
    rank: this.rank,
    stats: this.getStats(),
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);