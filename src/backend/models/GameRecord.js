/**
 * Game record/history model
 */

import mongoose from 'mongoose';

const gameRecordSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    default: 'casual',
    index: true,
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  winnerScore: {
    type: Number,
    required: true,
    min: 0,
  },
  loserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,  // Keep only ONE
  }],
  loserScores: [{
    type: Number,
    min: 0,
  }],
  duration: {
    type: Number, // milliseconds
    min: 0,
  },
  roundCount: {
    type: Number,
    min: 1,
  },
  playerCount: {
    type: Number,
    default: 2,
    min: 2,
    max: 6,
  },
  moves: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moveType: String,
    cardIds: [String],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  spectatorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Remove duplicate .index() calls

// Get game summary
gameRecordSchema.methods.getSummary = function () {
  return {
    gameId: this.gameId,
    gameMode: this.gameMode,
    winnerId: this.winnerId,
    winnerScore: this.winnerScore,
    loserCount: this.loserIds.length,
    playerCount: this.playerCount,
    duration: this.duration,
    roundCount: this.roundCount,
    createdAt: this.createdAt,
  };
};

// Calculate statistics
gameRecordSchema.statics.getGameStatistics = async function (userId) {
  const games = await this.find({
    $or: [
      { winnerId: userId },
      { loserIds: userId },
    ],
  });

  const wins = games.filter(g => g.winnerId.toString() === userId.toString()).length;
  const losses = games.length - wins;
  const totalScore = games.reduce((sum, g) => {
    if (g.winnerId.toString() === userId.toString()) {
      return sum + g.winnerScore;
    }
    return sum;
  }, 0);

  return {
    totalGames: games.length,
    wins,
    losses,
    winRate: games.length === 0 ? 0 : Math.round((wins / games.length) * 100),
    totalScore,
    averageScore: games.length === 0 ? 0 : Math.round(totalScore / games.length),
  };
};

export const GameRecord = mongoose.model('GameRecord', gameRecordSchema);