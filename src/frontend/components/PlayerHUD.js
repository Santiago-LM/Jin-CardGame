/**
 * Player info panels (top-left and top-right)
 */

export class PlayerHUD {
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
      <div class="hud-wrapper">
        <div class="hud-players"></div>
      </div>
    `;

    this.playersContainer = this.container.querySelector('.hud-players');
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
   * Render HUD
   */
  render(state) {
    this.playersContainer.innerHTML = state.players.map((player, index) => {
      const isCurrentPlayer = index === state.currentPlayerIndex;
      return this.createPlayerPanel(player, isCurrentPlayer);
    }).join('');
  }

  /**
   * Create player panel
   */
  createPlayerPanel(player, isCurrentPlayer) {
    const position = this.getPlayerPosition(this.gameState.state.players.indexOf(player));

    return `
      <div class="hud-panel ${position} ${isCurrentPlayer ? 'active' : ''}" data-player-id="${player.id}">
        <div class="avatar">${player.name.substring(0, 2).toUpperCase()}</div>
        <div class="hud-info">
          <div class="hud-name">${player.name}</div>
          <div class="hud-role">${player.handSize} cards</div>
        </div>
        <div class="hud-points-row">
          <span class="hud-points">${player.totalScore}</span>
          <span class="hud-pts-label">pts</span>
        </div>
        <div class="hud-status ${this.getStatusClass(player)}">
          ${this.getStatusText(player)}
        </div>
      </div>
    `;
  }

  /**
   * Get player position (for HUD placement)
   */
  getPlayerPosition(index) {
    const positions = ['top-left', 'top-center', 'top-right', 'bottom-right', 'bottom-center', 'bottom-left'];
    return positions[index % positions.length] || 'top-left';
  }

  /**
   * Get status class
   */
  getStatusClass(player) {
    if (!player.isActive) return 'status-disconnected';
    if (player.handSize === 0) return 'status-winner';
    return 'status-active';
  }

  /**
   * Get status text
   */
  getStatusText(player) {
    if (!player.isActive) return 'Disconnected';
    if (player.handSize === 0) return 'Winner';
    return `${player.handSize} cards`;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}