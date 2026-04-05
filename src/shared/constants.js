/**
 * Shared game constants used by frontend and backend
 */

export const CARD_VALUES = {
  HEART_ACE: 100,
  SPADE_QUEEN: 50,
  JOKER: 20,
  TWO: 20,
  ACE: 20,
  HIGH_CARD: 10, // 9, 10, J, Q, K
  LOW_CARD: 5,   // 3-8
};

export const GAME_RULES = {
  MIN_SET_SIZE: 4,
  STARTING_HAND_SIZE: 16,
  WINNING_SCORE: 1000,
  INACTIVITY_TIMEOUT: 3 * 60 * 1000, // 3 minutes
  MIN_CARDS_TO_STEAL: 2,
  FIRST_PLAY_MIN_CARDS: 8,
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
};

export const PLAYER_LIMITS = {
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 2,
};

export const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'JOKER'];
export const CARD_SUITS = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

export const WILD_CARDS = {
  JOKER: 'JOKER',
  TWO: '2',
};

export const SPECIAL_CARDS = {
  HEART_ACE: { rank: 'A', suit: 'HEARTS' },
  SPADE_QUEEN: { rank: 'Q', suit: 'SPADES' },
};

export const GAME_STATUS = {
  SETUP: 'SETUP',
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  ROUND_END: 'ROUND_END',
  GAME_END: 'GAME_END',
  PAUSED: 'PAUSED',
};

export const MOVE_TYPES = {
  PLAY_SETS: 'PLAY_SETS',
  DRAW_DECK: 'DRAW_DECK',
  DRAW_PILE: 'DRAW_PILE',
  STEAL_PILE: 'STEAL_PILE',
  DISCARD: 'DISCARD',
  JIN: 'JIN',
  UNDO: 'UNDO',
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Game lifecycle
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  START_GAME: 'startGame',
  GAME_STATE_UPDATED: 'gameStateUpdated',

  // Moves
  PLAY_MOVE: 'playMove',
  MOVE_APPLIED: 'moveApplied',
  MOVE_REJECTED: 'moveRejected',

  // Rounds
  ROUND_END: 'roundEnd',
  ROUND_START: 'roundStart',

  // Players
  TURN_START: 'turnStart',
  PLAYER_DISCONNECTED: 'playerDisconnected',
  PLAYER_RECONNECTED: 'playerReconnected',
  PLAYER_REMOVED: 'playerRemoved',

  // Spectators
  JOIN_AS_SPECTATOR: 'joinAsSpectator',
  SPECTATOR_JOINED: 'spectatorJoined',
  SPECTATOR_LEFT: 'spectatorLeft',

  // Specific moves
  DRAW_FROM_DECK: 'drawFromDeck',
  DRAW_FROM_PILE: 'drawFromPile',
  STEAL_FROM_PILE: 'stealFromPile',
  PLAY_SETS: 'playSets',
  PLAY_JIN: 'playJIN',
  DISCARD_CARDS: 'discardCards',
};