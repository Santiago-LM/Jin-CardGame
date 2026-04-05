/**
 * Room management routes
 */

const express = require('express');
const { RoomService } = require('../services/roomService');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();
const roomService = new RoomService();

/**
 * POST /api/rooms/create
 */
router.post('/create', auth, (req, res, next) => {
  try {
    const { roomConfig } = req.body;
    const room = roomService.createRoom(req.userId, roomConfig);

    res.status(201).json({
      roomId: room.id,
      hostId: room.hostId,
      config: room.config,
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
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:roomId
 */
router.get('/:roomId', (req, res, next) => {
  try {
    const room = roomService.getRoom(req.params.roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      id: room.id,
      hostId: room.hostId,
      config: room.config,
      playerCount: room.players.length,
      status: room.gameSession.status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:roomId/status
 */
router.get('/:roomId/status', (req, res, next) => {
  try {
    const status = roomService.getRoomStatus(req.params.roomId);

    if (!status) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rooms/:roomId/join
 */
router.post('/:roomId/join', auth, (req, res, next) => {
  try {
    const { playerName } = req.body;
    const room = roomService.joinRoom(req.params.roomId, req.userId, playerName);

    res.json({
      success: true,
      roomId: room.id,
      playerCount: room.players.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rooms/:roomId/leave
 */
router.post('/:roomId/leave', auth, (req, res, next) => {
  try {
    roomService.leaveRoom(req.params.roomId, req.userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;