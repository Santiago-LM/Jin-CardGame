/**
 * Backend-specific constants
 */

export const GAME_SETUP_TIMEOUT = 30000; // 30 seconds to start
export const MOVE_TIMEOUT = 300000; // 5 minutes per move
export const INACTIVITY_CHECK_INTERVAL = 10000; // Check every 10 seconds
export const MAX_RECONNECT_TIME = 3 * 60 * 1000; // 3 minutes

export const DEFAULT_GAME_CONFIG = {
  mode: 'casual',
  maxPlayers: 6,
  minPlayers: 2,
};

export const DECK_CONFIG = {
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 2,
};

export const SERVER_CONFIG = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  ENV: process.env.NODE_ENV || 'development',
};

export const TIMEOUTS = {
  GAME_SETUP: GAME_SETUP_TIMEOUT,
  MOVE: MOVE_TIMEOUT,
  INACTIVITY_CHECK: INACTIVITY_CHECK_INTERVAL,
  MAX_RECONNECT: MAX_RECONNECT_TIME,
};