/**
 * Input validation middleware
 */

export const validateMoveData = (req, res, next) => {
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

export const validateGameConfig = (req, res, next) => {
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

export const validateRoomId = (req, res, next) => {
  const { roomId } = req.params;

  if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  next();
};

export const validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  next();
};

export const validateAuthInput = (req, res, next) => {
  const { username, email, password } = req.body;

  // Check required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Validate username length
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { avatar, bio } = req.body;

  // Validate avatar if provided
  if (avatar !== undefined && (typeof avatar !== 'string' || avatar.length > 500)) {
    return res.status(400).json({ error: 'Invalid avatar value' });
  }

  // Validate bio if provided
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
    return res.status(400).json({ error: 'Bio must be 500 characters or less' });
  }

  next();
};