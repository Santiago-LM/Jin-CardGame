/**
 * Room model
 */

import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    default: 'casual',
    index: true,
  },
  maxPlayers: {
    type: Number,
    default: 6,
    min: 2,
    max: 6,
  },
  isPrivate: {
    type: Boolean,
    default: false,
    index: true,
  },
  inviteCode: {
    type: String,
    default: null,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['SETUP', 'IN_PROGRESS', 'PAUSED', 'ENDED'],
    default: 'SETUP',
    index: true,
  },
  settings: {
    autoStart: {
      type: Boolean,
      default: true,
    },
    timePerMove: {
      type: Number, // milliseconds
      default: 300000, // 5 minutes
    },
    pointsToWin: {
      type: Number,
      default: 1000,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for common queries
roomSchema.index({ hostId: 1, createdAt: -1 });
roomSchema.index({ status: 1, createdAt: -1 });
roomSchema.index({ gameMode: 1, isPrivate: 1 });

// Get room info
roomSchema.methods.getRoomInfo = function () {
  return {
    roomId: this.roomId,
    hostId: this.hostId,
    gameMode: this.gameMode,
    playerCount: this.players.length,
    maxPlayers: this.maxPlayers,
    isPrivate: this.isPrivate,
    status: this.status,
    createdAt: this.createdAt,
    startedAt: this.startedAt,
  };
};

// Check if room is full
roomSchema.methods.isFull = function () {
  return this.players.length >= this.maxPlayers;
};

// Check if room is ready to start
roomSchema.methods.isReadyToStart = function () {
  return this.players.length >= 2 && this.status === 'SETUP';
};

// Generate invite code
roomSchema.methods.generateInviteCode = function () {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.inviteCode = code;
  return code;
};

// Add player
roomSchema.methods.addPlayer = async function (userId) {
  if (this.isFull()) {
    throw new Error('Room is full');
  }
  if (this.players.includes(userId)) {
    throw new Error('Player already in room');
  }
  
  this.players.push(userId);
  await this.save();
  return this;
};

// Remove player
roomSchema.methods.removePlayer = async function (userId) {
  this.players = this.players.filter(id => id.toString() !== userId.toString());
  
  // If host leaves and room is not empty, make first player the new host
  if (this.hostId.toString() === userId.toString() && this.players.length > 0) {
    this.hostId = this.players[0];
  }
  
  await this.save();
  return this;
};

// Get public profile (no sensitive info)
roomSchema.methods.getPublicProfile = function () {
  return {
    roomId: this.roomId,
    gameMode: this.gameMode,
    playerCount: this.players.length,
    maxPlayers: this.maxPlayers,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export const Room = mongoose.model('Room', roomSchema);