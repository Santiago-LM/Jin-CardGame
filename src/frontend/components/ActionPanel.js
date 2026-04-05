/**
 * Action controls for playing moves
 */

export class ActionPanel {
  constructor(container, gameState, socket) {
    this.container = container;
    this.gameState = gameState;
    this.socket = socket;
    this.unsubscribers = [];

    this.setupDOM();
    this.setupEventListeners();
    this.setupStateSubscription();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.container.innerHTML = `
      <div class="action-panel">
        <div class="action-group">
          <button class="btn-action btn-draw-deck" title="Draw from top of deck">
            <span>Draw Deck</span>
          </button>
          <button class="btn-action btn-draw-pile" title="Draw from community pile">
            <span>Draw Pile</span>
          </button>
        </div>

        <div class="action-group">
          <button class="btn-action btn-play-sets" title="Play selected cards as sets">
            <span>Play Sets</span>
          </button>
          <button class="btn-action btn-jin" title="Play all remaining cards (JIN)">
            <span>JIN!</span>
          </button>
        </div>

        <div class="action-group">
          <button class="btn-action btn-discard" title="Discard selected cards">
            <span>Discard</span>
          </button>
          <button class="btn-action btn-undo" title="Undo last move">
            <span>Undo</span>
          </button>
        </div>

        <div class="action-status">
          <span class="status-message"></span>
        </div>
      </div>
    `;

    this.drawDeckBtn = this.container.querySelector('.btn-draw-deck');
    this.drawPileBtn = this.container.querySelector('.btn-draw-pile');
    this.playSetsBtn = this.container.querySelector('.btn-play-sets');
    this.jinBtn = this.container.querySelector('.btn-jin');
    this.discardBtn = this.container.querySelector('.btn-discard');
    this.undoBtn = this.container.querySelector('.btn-undo');
    this.statusMessage = this.container.querySelector('.status-message');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.drawDeckBtn.addEventListener('click', () => this.drawFromDeck());
    this.drawPileBtn.addEventListener('click', () => this.drawFromPile());
    this.playSetsBtn.addEventListener('click', () => this.playSets());
    this.jinBtn.addEventListener('click', () => this.playJIN());
    this.discardBtn.addEventListener('click', () => this.discard());
    this.undoBtn.addEventListener('click', () => this.undo());
  }

  /**
   * Setup state subscription
   */
  setupStateSubscription() {
    this.unsubscribers.push(
      this.gameState.subscribe((state) => {
        this.updateButtonStates(state);
        this.updateStatusMessage(state);
      })
    );
  }

  /**
   * Update button disabled states based on game state
   */
  updateButtonStates(state) {
    const isCurrentPlayer = state.players[state.currentPlayerIndex]?.id === state.playerId;
    const hasSelectedCards = state.selectedCards.size > 0;
    const isInProgress = state.moveInProgress;

    this.drawDeckBtn.disabled = !isCurrentPlayer || isInProgress || state.deckSize === 0;
    this.drawPileBtn.disabled = !isCurrentPlayer || isInProgress || state.communityPile.length === 0;
    this.playSetsBtn.disabled = !isCurrentPlayer || !hasSelectedCards || isInProgress;
    this.jinBtn.disabled = !isCurrentPlayer || isInProgress;
    this.discardBtn.disabled = !isCurrentPlayer || !hasSelectedCards || isInProgress;
    this.undoBtn.disabled = !isCurrentPlayer || isInProgress;
  }

  /**
   * Update status message
   */
  updateStatusMessage(state) {
    if (state.lastError) {
      this.statusMessage.textContent = state.lastError;
      this.statusMessage.className = 'status-message error';
    } else if (state.moveInProgress) {
      this.statusMessage.textContent = 'Processing move...';
      this.statusMessage.className = 'status-message info';
    } else if (state.players[state.currentPlayerIndex]?.id === state.playerId) {
      this.statusMessage.textContent = "It's your turn!";
      this.statusMessage.className = 'status-message active';
    } else {
      this.statusMessage.textContent = 'Waiting for other players...';
      this.statusMessage.className = 'status-message waiting';
    }
  }

  /**
   * Draw from deck
   */
  async drawFromDeck() {
    try {
      this.gameState.setMoveInProgress(true);

      await this.socket.drawFromDeck(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId')
      );

      this.gameState.clearSelectedCards();
      console.log('Drew from deck');
    } catch (error) {
      console.error('Draw failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Draw from pile
   */
  drawFromPile() {
    const pile = this.gameState.getSlice('communityPile');
    if (pile.length === 0) {
      this.gameState.setError('Community pile is empty');
      return;
    }

    // Draw top card (index 0)
    this.attemptDrawFromPile(0);
  }

  /**
   * Attempt to draw from pile at index
   */
  async attemptDrawFromPile(cardIndex) {
    try {
      this.gameState.setMoveInProgress(true);

      await this.socket.drawFromPile(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId'),
        cardIndex
      );

      console.log('Drew from pile');
    } catch (error) {
      console.error('Draw from pile failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Play selected cards as sets
   */
  async playSets() {
    const selectedCards = this.getSelectedCardIds();

    if (selectedCards.length < 4) {
      this.gameState.setError('Minimum 4 cards per set');
      return;
    }

    try {
      this.gameState.setMoveInProgress(true);

      await this.socket.playSets(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId'),
        selectedCards
      );

      this.gameState.clearSelectedCards();
      console.log('Sets played successfully');
    } catch (error) {
      console.error('Play sets failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Play all cards at once (JIN)
   */
  async playJIN() {
    const hand = this.gameState.getSlice('playerHand');
    const cardIds = hand.map(c => c.id);

    if (cardIds.length === 0) {
      this.gameState.setError('No cards to play');
      return;
    }

    try {
      this.gameState.setMoveInProgress(true);

      const confirmed = confirm('Play all remaining cards? (JIN - Double points if successful!)');
      if (!confirmed) {
        this.gameState.setMoveInProgress(false);
        return;
      }

      await this.socket.playJIN(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId'),
        cardIds
      );

      console.log('JIN played successfully!');
    } catch (error) {
      console.error('JIN failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Discard card(s)
   */
  async discard() {
    const selectedCards = this.getSelectedCardIds();

    if (selectedCards.length === 0) {
      this.gameState.setError('Select at least one card to discard');
      return;
    }

    try {
      this.gameState.setMoveInProgress(true);

      await this.socket.discardCards(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId'),
        selectedCards
      );

      this.gameState.clearSelectedCards();
      console.log('Cards discarded successfully');
    } catch (error) {
      console.error('Discard failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Undo last move
   */
  async undo() {
    try {
      this.gameState.setMoveInProgress(true);

      // Implementation depends on backend support
      console.log('Undo move');
      // await this.socket.undoMove(...);
    } catch (error) {
      console.error('Undo failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Get selected card IDs
   */
  getSelectedCardIds() {
    return Array.from(this.gameState.getSlice('selectedCards'));
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}