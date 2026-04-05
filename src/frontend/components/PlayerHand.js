/**
 * Player hand display with sorting and card selection
 */

import { CardAnimationService } from '../services/CardAnimationService.js';

export class PlayerHand {
  constructor(container, gameState, socket) {
    this.container = container;
    this.gameState = gameState;
    this.socket = socket;
    this.sortBy = 'default';
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
      <div class="hand-container">
        <div class="hand-header">
          <h3>Your Hand</h3>
          <div class="hand-controls">
            <button class="sort-btn" data-sort="default" title="Default order">Default</button>
            <button class="sort-btn" data-sort="suit" title="Sort by suit">By Suit</button>
            <button class="sort-btn" data-sort="rank" title="Sort by rank">By Rank</button>
            <button class="sort-btn" data-sort="type" title="Sort by card type">By Type</button>
          </div>
        </div>
        <div class="hand-cards"></div>
        <div class="hand-stats">
          <span class="card-count">0 cards</span>
        </div>
      </div>
    `;

    this.cardsContainer = this.container.querySelector('.hand-cards');
    this.sortButtons = this.container.querySelectorAll('.sort-btn');
    this.cardCountEl = this.container.querySelector('.card-count');

    // Mark default as active
    this.container.querySelector('[data-sort="default"]').classList.add('active');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Sort buttons
    this.sortButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setSortOrder(e.target.dataset.sort);
      });
    });

    // Card selection (delegated)
    this.cardsContainer.addEventListener('click', (e) => {
      const cardElement = e.target.closest('.card');
      if (cardElement) {
        const cardId = cardElement.dataset.cardId;
        this.gameState.selectCard(cardId);
        CardAnimationService.animateCardSelect(cardElement);
      }
    });

    // Card deselection
    this.cardsContainer.addEventListener('dblclick', (e) => {
      const cardElement = e.target.closest('.card');
      if (cardElement) {
        const cardId = cardElement.dataset.cardId;
        this.gameState.selectCard(cardId); // Toggle
        CardAnimationService.animateCardDeselect(cardElement);
      }
    });
  }

  /**
   * Setup state subscription
   */
  setupStateSubscription() {
    this.unsubscribers.push(
      this.gameState.subscribe((state) => {
        if (state.playerHand.length > 0 || this.lastHandSize !== state.playerHand.length) {
          this.lastHandSize = state.playerHand.length;
          this.render(state);
        }
      })
    );
  }

  /**
   * Set sort order
   */
  setSortOrder(sortType) {
    this.sortBy = sortType;
    this.gameState.clearSelectedCards();
    this.updateSortButtonUI();
    this.render(this.gameState.getState());
  }

  /**
   * Update sort button UI
   */
  updateSortButtonUI() {
    this.sortButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === this.sortBy);
    });
  }

  /**
   * Get sorted hand
   */
  getSortedHand(hand) {
    const sorted = [...hand];

    switch (this.sortBy) {
      case 'suit':
        return sorted.sort((a, b) => a.suit.localeCompare(b.suit));
      case 'rank':
        return sorted.sort((a, b) => this.rankOrder(a.rank) - this.rankOrder(b.rank));
      case 'type':
        return sorted.sort((a, b) => this.cardType(a) - this.cardType(b));
      default:
        return sorted;
    }
  }

  /**
   * Render hand
   */
  render(state) {
    const sortedHand = this.getSortedHand(state.playerHand);
    const selectedCardIds = state.selectedCards;

    this.cardsContainer.innerHTML = sortedHand.map(card => {
      const isSelected = selectedCardIds.has(card.id);
      return this.createCardElement(card, isSelected);
    }).join('');

    // Update card count
    if (this.cardCountEl) {
      this.cardCountEl.textContent = `${state.playerHand.length} card${state.playerHand.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create card element HTML
   */
  createCardElement(card, isSelected) {
    const suits = { 'HEARTS': '♥', 'DIAMONDS': '♦', 'CLUBS': '♣', 'SPADES': '♠' };
    const suitSymbol = suits[card.suit] || '';

    return `
      <div class="card ${isSelected ? 'selected' : ''}" data-card-id="${card.id}">
        <div class="card-inner">
          <span class="card-rank">${card.rank}</span>
          <span class="card-suit">${suitSymbol}</span>
        </div>
      </div>
    `;
  }

  /**
   * Rank order helper
   */
  rankOrder(rank) {
    const order = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7,
      '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, 'JOKER': 0,
    };
    return order[rank] || 0;
  }

  /**
   * Card type helper
   */
  cardType(card) {
    if (card.rank === 'JOKER' || card.rank === '2') return 0; // Wild
    if ((card.rank === 'A' && card.suit === 'HEARTS') || (card.rank === 'Q' && card.suit === 'SPADES')) return 1; // Special
    return 2; // Standard
  }

  /**
   * Get selected cards
   */
  getSelectedCards() {
    const hand = this.gameState.getSlice('playerHand');
    const selectedIds = this.gameState.getSlice('selectedCards');
    return hand.filter(card => selectedIds.has(card.id));
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}