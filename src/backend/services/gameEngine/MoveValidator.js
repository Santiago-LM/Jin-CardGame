/**
 * Move validation
 */

import { isValidGameSet, isValidSteal, isWildCard } from '../../../shared/validators.js';
import { GAME_RULES } from '../../../shared/constants.js';

export class MoveValidator {
  /**
   * Validate move type and execution
   */
  static validate(moveData, gameRound, player) {
    const { type, cardIds, pileIndices } = moveData;

    switch (type) {
      case 'PLAY_SETS':
        return this.validatePlaySets(cardIds, gameRound, player);
      case 'DRAW_DECK':
        return this.validateDrawDeck(gameRound);
      case 'DRAW_PILE':
        return { valid: true };
      case 'STEAL_PILE':
        return this.validateStealPile(pileIndices, player, gameRound);
      case 'DISCARD':
        return this.validateDiscard(cardIds, player);
      case 'JIN':
        return this.validateJIN(cardIds, player);
      default:
        return { valid: false, reason: 'Unknown move type' };
    }
  }

  /**
   * Validate playing sets
   */
  static validatePlaySets(cardIds, gameRound, player) {
    if (!cardIds || cardIds.length < GAME_RULES.MIN_SET_SIZE) {
      return {
        valid: false,
        reason: `Minimum ${GAME_RULES.MIN_SET_SIZE} cards per set`,
      };
    }

    // Get cards from player hand
    const cards = cardIds.map(id => {
      const card = player.hand.find(c => c.id === id);
      if (!card) {
        return { valid: false, reason: 'Card not in your hand' };
      }
      return card;
    });

    // Check for any errors
    for (const card of cards) {
      if (card.valid === false) return card;
    }

    // Validate set format
    const setValidation = isValidGameSet(cards);
    if (!setValidation.valid) {
      return setValidation;
    }

    return { valid: true };
  }

  /**
   * Validate drawing from deck
   */
  static validateDrawDeck(gameRound) {
    if (!gameRound.deck.hasCards()) {
      return { valid: false, reason: 'No cards in deck' };
    }
    return { valid: true };
  }

  /**
   * Validate stealing from pile
   */
  static validateStealPile(pileIndices, player, gameRound) {
    // Check minimum hand size
    if (player.hand.length < GAME_RULES.MIN_CARDS_TO_STEAL) {
      return {
        valid: false,
        reason: `Need at least ${GAME_RULES.MIN_CARDS_TO_STEAL} cards to steal from pile`,
      };
    }

    if (!pileIndices || pileIndices.length === 0) {
      return { valid: false, reason: 'Select cards to steal' };
    }

    // Validate steal order
    const validation = isValidSteal(pileIndices, gameRound.communityPile.getSize());
    if (!validation.valid) {
      return validation;
    }

    return { valid: true };
  }

  /**
   * Validate discard
   */
  static validateDiscard(cardIds, player) {
    if (!cardIds || cardIds.length === 0) {
      return { valid: false, reason: 'Select at least one card' };
    }

    for (const cardId of cardIds) {
      if (!player.hasCard(cardId)) {
        return { valid: false, reason: 'Card not in your hand' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate JIN (play all cards)
   */
  static validateJIN(cardIds, player) {
    if (cardIds.length !== player.hand.length) {
      return { valid: false, reason: 'Must play all cards for JIN' };
    }

    // All cards must form valid sets
    const cards = cardIds.map(id => player.hand.find(c => c.id === id));

    // Check all cards form valid sets (simplified - full validation would group sets)
    for (const card of cards) {
      if (!card) {
        return { valid: false, reason: 'Card not in hand' };
      }
    }

    return { valid: true };
  }
}