/**
 * Input validation middleware
 */

const validateMoveData = (req, res, next) => {
  const { moveData } = req.body;

  if (!moveData || typeof moveData !== 'object') {
    return res.status(400).json({ error: 'Invalid move data' });
  }

  const { type, cardIds } = moveData;

  if (!type) {
    return res.status(400).json({ error: 'Move type is required' });
  }

  next();
};

const validateGameConfig = (req, res, next) => {
  const { roomConfig } = req.body;

  if (!roomConfig) {
    return res.status(400).json({ error: 'Room configuration required' });
  }

  const { mode, maxPlayers } = roomConfig;

  if (mode && !['casual', 'ranked'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid game mode' });
  }

  if (maxPlayers && (maxPlayers < 2 || maxPlayers > 6)) {
    return res.status(400).json({ error: 'Max players must be between 2 and 6' });
  }

  next();
};

module.exports = { validateMoveData, validateGameConfig };