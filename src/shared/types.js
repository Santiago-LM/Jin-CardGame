/**
 * Type definitions and interfaces (documentation purposes)
 * Not enforced in JavaScript, but useful for understanding structure
 */

/**
 * @typedef {Object} Card
 * @property {string} id - Unique card identifier
 * @property {string} rank - A, 2-10, J, Q, K, JOKER
 * @property {string} suit - HEARTS, DIAMONDS, CLUBS, SPADES
 */

/**
 * @typedef {Object} GameSet
 * @property {Card[]} cards - Cards in the set
 * @property {string} type - MATCHING or STRAIGHT
 * @property {boolean} isValid - Whether set is valid
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Player ID
 * @property {string} name - Player name
 * @property {Card[]} hand - Cards in hand
 * @property {number} totalScore - Cumulative score
 * @property {number} roundScore - Current round score
 * @property {boolean} isActive - Whether player is active
 * @property {number} lastActivity - Timestamp of last activity
 */

/**
 * @typedef {Object} GameSession
 * @property {string} gameId - Unique game identifier
 * @property {Player[]} players - Array of players
 * @property {number} currentPlayerIndex - Index of current player
 * @property {Card[]} communityPile - Community pile cards
 * @property {Card[]} deck - Remaining deck cards
 * @property {number} round - Current round number
 * @property {string} status - Game status
 * @property {Object} history - Move history
 * @property {Spectator[]} spectators - Spectators watching
 */

/**
 * @typedef {Object} Move
 * @property {string} playerId - Player making move
 * @property {string} type - PLAY_SETS, DRAW_DECK, etc.
 * @property {Card[]} cards - Cards involved
 * @property {number} timestamp - When move was made
 * @property {boolean} isValid - Whether move was valid
 * @property {string} reason - Rejection reason if invalid
 */

/**
 * @typedef {Object} Spectator
 * @property {string} id - Spectator ID
 * @property {number} joinedAt - Timestamp of join
 */

/**
 * @typedef {Object} GameState
 * @property {string} gameId - Game identifier
 * @property {string} status - Current game status
 * @property {number} currentPlayerIndex - Current player
 * @property {Player[]} players - All players (no private hands)
 * @property {Card[]} communityPile - Public pile
 * @property {number} deckSize - Remaining deck size
 * @property {number} round - Current round
 * @property {Object} scores - Scores by player ID
 */