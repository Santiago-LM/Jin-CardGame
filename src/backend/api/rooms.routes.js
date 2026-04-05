import express from 'express';
import { RoomService } from '../services/roomService.js';
import { auth } from '../middleware/auth.middleware.js';
import { validateGameConfig, validateRoomId } from '../middleware/validation.middleware.js';

const router = express.Router();
const roomService = new RoomService();

/**
 * POST /api/rooms/create
 */
router.post('/create', auth, validateGameConfig, (req, res, next) => {
  try {
    const { roomConfig } = req.body;
    console.log(`[API] Creating room for user ${req.userId}`, roomConfig);

    const room = roomService.createRoom(req.userId, roomConfig);

    res.status(201).json({
      success: true,
      roomId: room.id,
      hostId: room.hostId,
      config: room.config,
      message: 'Room created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/public
 */
router.get('/public', (req, res, next) => {
  try {
    const rooms = roomService.getPublicRooms();
    console.log(`[API] Fetching public rooms, found ${rooms.length}`);

    res.json({
      success: true,
      rooms,
      count: rooms.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:roomId
 */
router.get('/:roomId', validateRoomId, (req, res, next) => {
  try {
    const room = roomService.getRoom(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        hostId: room.hostId,
        config: room.config,
        playerCount: room.players.length,
        status: room.gameSession.status,
        players: room.players,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:roomId/status
 */
router.get('/:roomId/status', validateRoomId, (req, res, next) => {
  try {
    const status = roomService.getRoomStatus(req.params.roomId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rooms/:roomId/join
 */
router.post('/:roomId/join', auth, validateRoomId, (req, res, next) => {
  try {
    const { playerName } = req.body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Valid player name is required',
      });
    }

    console.log(`[API] Player ${req.userId} joining room ${req.params.roomId}`);
    const room = roomService.joinRoom(req.params.roomId, req.userId, playerName);

    res.json({
      success: true,
      roomId: room.id,
      playerCount: room.players.length,
      gameStatus: room.gameSession.status,
      message: `${playerName} joined the room`,
    });
  } catch (error) {
    if (error.message.includes('full')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/rooms/:roomId/leave
 */
router.post('/:roomId/leave', auth, validateRoomId, (req, res, next) => {
  try {
    console.log(`[API] Player ${req.userId} leaving room ${req.params.roomId}`);
    roomService.leaveRoom(req.params.roomId, req.userId);

    res.json({
      success: true,
      message: 'Successfully left the room',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rooms/:roomId/start
 */
router.post('/:roomId/start', auth, validateRoomId, (req, res, next) => {
  try {
    const room = roomService.getRoom(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    if (room.hostId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the host can start the game',
      });
    }

    if (room.players.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 2 players to start',
      });
    }

    console.log(`[API] Starting game in room ${req.params.roomId}`);
    room.gameSession.startGame();

    res.json({
      success: true,
      gameState: room.gameSession.getGameState(),
      message: 'Game started!',
    });
  } catch (error) {
    next(error);
  }
});

export default router;