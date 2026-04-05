/**
 * Main game table component with 3D rendering
 */

import { CardRenderer } from '../renderers/CardRenderer.js';
import { TableRenderer } from '../renderers/TableRenderer.js';

export class GameTable {
  constructor(container, gameState, socket) {
    this.container = container;
    this.gameState = gameState;
    this.socket = socket;
    this.unsubscribers = [];

    this.setupDOM();
    this.setupStateSubscription();
    this.initTableRenderer();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.container.innerHTML = `
      <div class="game-table-wrapper">
        <canvas id="gameTableCanvas" class="game-table-canvas"></canvas>
        <div class="community-pile-center"></div>
        <div class="table-info">
          <span class="round-number"></span>
          <span class="deck-count"></span>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#gameTableCanvas');
    this.roundEl = this.container.querySelector('.round-number');
    this.deckEl = this.container.querySelector('.deck-count');

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resize canvas
   */
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    if (this.tableRenderer) {
      this.tableRenderer.resize(this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Initialize table renderer
   */
  initTableRenderer() {
    this.tableRenderer = new TableRenderer(this.canvas);
    this.tableRenderer.init();
    this.tableRenderer.animate();
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
   * Render table state
   */
  render(state) {
    // Update round info
    if (this.roundEl) {
      this.roundEl.textContent = `Round ${state.round}`;
    }

    // Update deck count
    if (this.deckEl) {
      this.deckEl.textContent = `Deck: ${state.deckSize}`;
    }

    // Update 3D table
    if (this.tableRenderer) {
      this.tableRenderer.updatePlayers(state.players);
      this.tableRenderer.updateCommunityPile(state.communityPile);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    if (this.tableRenderer) {
      this.tableRenderer.dispose();
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}