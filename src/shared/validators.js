/**
 * Shared validation functions
 */

import { CARD_RANKS, WILD_CARDS } from './constants.js';

/**
 * Check if cards form valid matching set
 */
export function isValidMatchingSet(cards) {
  if (cards.length < 4) return { valid: false, reason: 'Minimum 4 cards per set' };

  const ranks = cards.map(c => c.rank);
  const uniqueRanks = new Set(ranks);

  if (uniqueRanks.size !== 1) {
    return { valid: false, reason: 'All cards must have same rank' };
  }

  if (hasAdjacentWildcards(cards)) {
    return { valid: false, reason: 'Wild cards cannot be adjacent' };
  }

  return { valid: true };
}

/**
 * Check if cards form valid straight
 */
export function isValidStraight(cards) {
  if (cards.length < 4) return { valid: false, reason: 'Minimum 4 cards per straight' };

  // All cards must be same suit
  const suits = cards.map(c => c.suit);
  if (new Set(suits).size !== 1) {
    return { valid: false, reason: 'All cards must be same suit' };
  }

  // Sort by rank number
  const sortedCards = [...cards].sort((a, b) => getRankNumber(a.rank) - getRankNumber(b.rank));
  const rankNumbers = sortedCards.map(c => getRankNumber(c.rank));

  // Check for consecutive sequence (allowing wildcards)
  for (let i = 1; i < rankNumbers.length; i++) {
    const diff = rankNumbers[i] - rankNumbers[i - 1];
    if (diff > 1) {
      // Gap exists - check if previous was wildcard
      if (!Object.values(WILD_CARDS).includes(sortedCards[i - 1].rank)) {
        return { valid: false, reason: 'Cards must form consecutive sequence' };
      }
    }
  }

  if (hasAdjacentWildcards(cards)) {
    return { valid: false, reason: 'Wild cards cannot be adjacent' };
  }

  return { valid: true };
}

/**
 * Check for adjacent wild cards
 */
export function hasAdjacentWildcards(cards) {
  for (let i = 0; i < cards.length - 1; i++) {
    if (isWildCard(cards[i]) && isWildCard(cards[i + 1])) {
      return true;
    }
  }
  return false;
}

/**
 * Check if card is wild
 */
export function isWildCard(card) {
  return card.rank === 'JOKER' || card.rank === '2';
}

/**
 * Get rank numeric value
 */
export function getRankNumber(rank) {
  const values = {
    'A': 14,
    'K': 13,
    'Q': 12,
    'J': 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
    'JOKER': 0,
  };
  return values[rank] || 0;
}

/**
 * Get card point value
 */
export function getCardValue(card) {
  if (card.rank === 'A' && card.suit === 'HEARTS') return 100;
  if (card.rank === 'Q' && card.suit === 'SPADES') return 50;
  if (card.rank === 'JOKER' || card.rank === '2') return 20;
  if (card.rank === 'A') return 20;
  if (['9', '10', 'J', 'Q', 'K'].includes(card.rank)) return 10;
  return 5; // 3-8
}

/**
 * Check if valid set or straight
 */
export function isValidGameSet(cards) {
  // Try matching set first
  const matchingValidation = isValidMatchingSet(cards);
  if (matchingValidation.valid) {
    return { valid: true, type: 'MATCHING' };
  }

  // Try straight
  const straightValidation = isValidStraight(cards);
  if (straightValidation.valid) {
    return { valid: true, type: 'STRAIGHT' };
  }

  return { valid: false, reason: 'Cards do not form valid set or straight' };
}

/**
 * Check if steal is valid
 */
export function isValidSteal(cardIndices, pileSize) {
  if (!cardIndices || cardIndices.length === 0) {
    return { valid: false, reason: 'Select at least one card' };
  }

  // Indices must be consecutive from top
  const sorted = [...cardIndices].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      return { valid: false, reason: 'Must take consecutive cards from top of pile' };
    }
  }

  if (sorted[sorted.length - 1] >= pileSize) {
    return { valid: false, reason: 'Invalid card index' };
  }

  return { valid: true };
}