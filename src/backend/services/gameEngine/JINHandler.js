/**
 * JIN (all-in play) mechanics
 */

export class JINHandler {
  /**
   * Validate JIN play
   */
  static validateJIN(cards, player) {
    if (!cards || cards.length === 0) {
      return { valid: false, reason: 'No cards to play' };
    }

    if (cards.length !== player.hand.length) {
      return {
        valid: false,
        reason: 'Must play all cards for JIN',
      };
    }

    return { valid: true };
  }

  /**
   * Execute JIN play
   */
  static executeJIN(player, cards) {
    player.hand = [];
    player.didJIN = true;
    return {
      success: true,
      playerHand: player.hand,
      message: 'JIN played successfully!',
    };
  }

  /**
   * Calculate JIN bonus (double points)
   */
  static calculateJINBonus(baseScore) {
    return baseScore * 2;
  }

  /**
   * Check if JIN was successful
   */
  static isJINSuccessful(player) {
    return player.hand.length === 0 && player.didJIN;
  }

  /**
   * Get JIN celebration data
   */
  static getJINCelebration(playerName) {
    return {
      type: 'JIN',
      playerName,
      message: `${playerName} played JIN and won the round!`,
      animation: 'jin-celebration',
      sound: 'jin-victory',
    };
  }
}