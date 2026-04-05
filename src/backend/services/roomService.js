/**
 * Room/Game session management service
 */

const { v4: uuidv4 } = require('uuid');
const { GameSession } = require('./gameEngine/GameSession');
const { GAME_RULES } = require('../../shared/constants');

class RoomService {
  constructor() {
    this.rooms = new Map();
    this.inactivityCheckInterval = setInterval(() => {
      this.checkAllRoomInactivity();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Create a new room/game
   */
  createRoom(hostId, roomConfig = {}) {
    const roomId = uuidv4();
    const gameSession = new GameSession(
      roomId,
      [hostId],
      { [hostId]: roomConfig.hostName || 'Host' },
      roomConfig.mode || 'casual'
    );

    this.rooms.set(roomId, {
      id: roomId,
      hostId,
      config: {
        mode: roomConfig.mode || 'casual',
        maxPlayers: roomConfig.maxPlayers || 6,
        isPrivate: roomConfig.isPrivate || false,
        inviteCode: roomConfig.inviteCode || null,
      },
      gameSession,
      createdAt: Date.now(),
      players: [hostId],
      spectators: [],
    });

    return this.rooms.get(roomId);
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Join room
   */
  joinRoom(roomId, playerId, playerName) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.includes(playerId)) {
      throw new Error('Player already in room');
    }

    if (room.players.length >= room.config.maxPlayers) {
      throw new Error('Room is full');
    }

    room.players.push(playerId);
    room.gameSession.players.push({
      id: playerId,
      name: playerName,
      hand: [],
      totalScore: 0,
      roundScore: 0,
      isActive: true,
      lastActivity: Date.now(),
      wins: 0,
      losses: 0,
    });

    return room;
  }

  /**
   * Leave room
   */
  leaveRoom(roomId, playerId) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    room.players = room.players.filter(id => id !== playerId);
    room.gameSession.removePlayer(playerId);

    // Delete room if empty or only has host
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    }

    return room;
  }

  /**
   * Delete room
   */
  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }

  /**
   * Get all public rooms
   */
  getPublicRooms() {
    const rooms = [];
    this.rooms.forEach(room => {
      if (!room.config.isPrivate) {
        rooms.push({
          id: room.id,
          hostId: room.hostId,
          mode: room.config.mode,
          playerCount: room.players.length,
          maxPlayers: room.config.maxPlayers,
          createdAt: room.createdAt,
        });
      }
    });
    return rooms;
  }

  /**
   * Check inactivity for all rooms
   */
  checkAllRoomInactivity() {
    this.rooms.forEach((room, roomId) => {
      const inactivePlayerIds = room.gameSession.checkInactivity();
      inactivePlayerIds.forEach(playerId => {
        room.players = room.players.filter(id => id !== playerId);
      });

      // Delete room if empty
      if (room.players.length === 0) {
        this.deleteRoom(roomId);
      }
    });
  }

  /**
   * Get room status
   */
  getRoomStatus(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return null;
    }

    return {
      roomId,
      status: room.gameSession.status,
      playerCount: room.players.length,
      spectatorCount: room.spectators.length,
      round: room.gameSession.currentRound?.roundNumber || 0,
      gameMode: room.config.mode,
    };
  }
}

module.exports = { RoomService };