/**
 * Round and turn information display
 */

export class RoundInfo {
  constructor(container, gameState) {
    this.container = container;
    this.gameState = gameState;
    this.unsubscribers = [];

    this.setupDOM();
    this.setupStateSubscription();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.container.innerHTML = `
      <div class="round-info-container">
        <div class="round-section">
          <h4>Round</h4>
          <span class="round-number">1</span>
        </div>

        <div class="turn-section">
          <h4>Current Turn</h4>
          <span class="current-player">--</span>
        </div>

        <div class="deck-section">
          <h4>Deck</h4>
          <span class="deck-remaining">0</span>
        </div>

        <div class="pile-section">
          <h4>Pile</h4>
          <span class="pile-size">0</span>
        </div>
      </div>
    `;

    this.roundNumber = this.container.querySelector('.round-number');
    this.currentPlayerEl = this.container.querySelector('.current-player');
    this.deckRemaining = this.container.querySelector('.deck-remaining');
    this.pileSize = this.container.querySelector('.pile-size');
  }

  /**
   * Setup state subscription
   */
  setupStateSubscription() {
    this.unsubscribers.push(
      this.gameState.subscribe((state) => {
        this.render(state);
      })
    );
  }

  /**
   * Render round info
   */
  render(state) {
    // Update round
    if (this.roundNumber) {
      this.roundNumber.textContent = state.round;
    }

    // Update current player
    if (this.currentPlayerEl) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      this.currentPlayerEl.textContent = currentPlayer ? currentPlayer.name : '--';
      this.currentPlayerEl.className = 'current-player' + (currentPlayer?.id === state.playerId ? ' is-you' : '');
    }

    // Update deck
    if (this.deckRemaining) {
      this.deckRemaining.textContent = state.deckSize;
    }

    // Update pile
    if (this.pileSize) {
      this.pileSize.textContent = state.communityPile.length;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}