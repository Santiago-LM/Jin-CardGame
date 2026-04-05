/**
 * WebSocket event constants
 */

export const GAME_EVENTS = {
  // Connection lifecycle
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',

  // Game setup
  CREATE_GAME: 'createGame',
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  START_GAME: 'startGame',
  GAME_READY: 'gameReady',

  // Game state
  GAME_STATE_UPDATED: 'gameStateUpdated',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',

  // Turns
  TURN_START: 'turnStart',
  TURN_END: 'turnEnd',

  // Moves
  PLAY_SETS: 'playSets',
  DRAW_DECK: 'drawFromDeck',
  DRAW_PILE: 'drawFromPile',
  STEAL_PILE: 'stealFromPile',
  DISCARD: 'discardCards',
  PLAY_JIN: 'playJIN',
  MOVE_APPLIED: 'moveApplied',
  MOVE_REJECTED: 'moveRejected',

  // Rounds
  ROUND_START: 'roundStart',
  ROUND_END: 'roundEnd',
  ROUND_SCORES: 'roundScores',

  // Game end
  GAME_END: 'gameEnd',
  WINNER: 'winner',

  // Disconnection
  PLAYER_DISCONNECTED: 'playerDisconnected',
  PLAYER_RECONNECTED: 'playerReconnected',
  PLAYER_KICKED: 'playerKicked',

  // Spectators
  JOIN_SPECTATOR: 'joinAsSpectator',
  SPECTATOR_JOINED: 'spectatorJoined',
  SPECTATOR_LEFT: 'spectatorLeft',

  // Misc
  CHAT: 'chat',
  INACTIVITY_WARNING: 'inactivityWarning',
};

export const ERROR_CODES = {
  INVALID_MOVE: 'INVALID_MOVE',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INSUFFICIENT_PLAYERS: 'INSUFFICIENT_PLAYERS',
  INVALID_GAME_STATE: 'INVALID_GAME_STATE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVER_ERROR: 'SERVER_ERROR',
};