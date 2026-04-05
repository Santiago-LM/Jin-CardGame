/**
 * Room model
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    default: 'casual',
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
  },
  status: {
    type: String,
    enum: ['SETUP', 'IN_PROGRESS', 'PAUSED', 'ENDED'],
    default: 'SETUP',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Room', roomSchema);