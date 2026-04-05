/**
 * Shared card utility functions
 */

import { CARD_SUITS, CARD_RANKS, WILD_CARDS } from './constants.js';

/**
 * Create a card object
 */
export function createCard(rank, suit, id) {
  if (!CARD_RANKS.includes(rank)) {
    throw new Error(`Invalid rank: ${rank}`);
  }
  if (!CARD_SUITS.includes(suit)) {
    throw new Error(`Invalid suit: ${suit}`);
  }

  return {
    id: id || generateCardId(),
    rank,
    suit,
  };
}

/**
 * Generate unique card ID
 */
export function generateCardId() {
  return `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

/**
 * Get suit symbol
 */
export function getSuitSymbol(suit) {
  const symbols = {
    'HEARTS': '♥',
    'DIAMONDS': '♦',
    'CLUBS': '♣',
    'SPADES': '♠',
  };
  return symbols[suit] || '';
}

/**
 * Format card display
 */
export function formatCard(card) {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}

/**
 * Check if card is wildcard
 */
export function isWildcard(card) {
  return card.rank === 'JOKER' || card.rank === '2';
}

/**
 * Find card in array by ID
 */
export function findCardById(cards, cardId) {
  return cards.find(c => c.id === cardId);
}

/**
 * Remove card from array by ID
 */
export function removeCardById(cards, cardId) {
  return cards.filter(c => c.id !== cardId);
}

/**
 * Compare cards for equality (ignoring ID)
 */
export function cardsEqual(card1, card2) {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * Sort cards by rank
 */
export function sortByRank(cards) {
  const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, 'JOKER': 0 };
  return [...cards].sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank]);
}

/**
 * Sort cards by suit
 */
export function sortBySuit(cards) {
  const suitOrder = { 'SPADES': 0, 'HEARTS': 1, 'DIAMONDS': 2, 'CLUBS': 3 };
  return [...cards].sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit]);
}

/**
 * Sort cards by suit then rank
 */
export function sortBySuitThenRank(cards) {
  return sortBySuit(cards).sort((a, b) => {
    if (a.suit !== b.suit) return 0; // Already sorted by suit
    const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, 'JOKER': 0 };
    return rankOrder[b.rank] - rankOrder[a.rank];
  });
}