/**
 * Game record/history model
 */

const mongoose = require('mongoose');

const gameRecordSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    default: 'casual',
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  winnerScore: {
    type: Number,
    required: true,
  },
  loserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  loserScores: [{
    type: Number,
  }],
  duration: {
    type: Number, // milliseconds
  },
  roundCount: {
    type: Number,
  },
  playerCount: {
    type: Number,
    default: 2,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  moves: [{
    playerId: mongoose.Schema.Types.ObjectId,
    moveType: String,
    timestamp: Date,
  }],
});

module.exports = mongoose.model('GameRecord', gameRecordSchema);