/**
 * Community pile display with steal interaction
 */

export class CommunityPile {
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
      <div class="pile-container">
        <h3>Community Pile</h3>
        <div class="pile-cards"></div>
        <div class="pile-actions">
          <button class="steal-btn" disabled>Steal Selected</button>
          <span class="pile-count">0 cards</span>
        </div>
      </div>
    `;

    this.cardsContainer = this.container.querySelector('.pile-cards');
    this.stealBtn = this.container.querySelector('.steal-btn');
    this.countSpan = this.container.querySelector('.pile-count');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.cardsContainer.addEventListener('click', (e) => {
      const cardElement = e.target.closest('.pile-card');
      if (cardElement) {
        const index = parseInt(cardElement.dataset.index);
        this.selectPileCard(index);
      }
    });

    this.stealBtn.addEventListener('click', () => this.requestSteal());
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
   * Render pile
   */
  render(state) {
    const pile = state.communityPile;
    const selectedIndices = state.selectedPileIndices;

    this.cardsContainer.innerHTML = pile.map((card, index) => {
      const isSelected = selectedIndices.has(index);
      return this.createCardElement(card, index, isSelected);
    }).join('');

    // Update count
    if (this.countSpan) {
      this.countSpan.textContent = `${pile.length} card${pile.length !== 1 ? 's' : ''}`;
    }

    this.updateStealButton(state);
  }

  /**
   * Create card element
   */
  createCardElement(card, index, isSelected) {
    const suits = { 'HEARTS': '♥', 'DIAMONDS': '♦', 'CLUBS': '♣', 'SPADES': '♠' };
    const suitSymbol = suits[card.suit] || '';

    return `
      <div class="pile-card ${isSelected ? 'selected' : ''}" data-index="${index}">
        <span class="card-rank">${card.rank}</span>
        <span class="card-suit">${suitSymbol}</span>
      </div>
    `;
  }

  /**
   * Select pile card
   */
  selectPileCard(index) {
    this.gameState.selectPileIndex(index);
  }

  /**
   * Update steal button state
   */
  updateStealButton(state) {
    const canSteal = state.playerHand.length >= 2;
    const hasSelection = state.selectedPileIndices.size > 0;
    const isCurrentPlayer = this.gameState.isCurrentPlayer();

    this.stealBtn.disabled = !canSteal || !hasSelection || !isCurrentPlayer || state.moveInProgress;
  }

  /**
   * Request steal from server
   */
  async requestSteal() {
    try {
      this.gameState.setMoveInProgress(true);

      const indices = Array.from(this.gameState.getSlice('selectedPileIndices'));
      const pile = this.gameState.getSlice('communityPile');
      const cardsToTake = indices.map(i => pile[i]);

      await this.socket.stealFromPile(
        this.gameState.getSlice('gameId'),
        this.gameState.getSlice('playerId'),
        indices,
        null // Payment card selection logic here
      );

      this.gameState.clearSelectedPileIndices();
      console.log('Stole from pile successfully');
    } catch (error) {
      console.error('Steal failed:', error);
      this.gameState.setError(error.message);
    } finally {
      this.gameState.setMoveInProgress(false);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}