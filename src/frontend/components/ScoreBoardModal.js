/**
 * Scoreboard modal for round end
 */

export class ScoreBoardModal {
  constructor(container, scores) {
    this.container = container;
    this.scores = scores;
    this.isVisible = false;

    this.setupDOM();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="scoreboardBackdrop">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h2 class="modal-title">Round Results</h2>
            <button class="modal-close" data-close="scoreboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <table class="score-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Round Score</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody class="score-tbody">
                <!-- Rows injected -->
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn-modal-confirm" onclick="location.reload()">Next Round</button>
          </div>
        </div>
      </div>
    `;

    this.backdrop = this.container.querySelector('#scoreboardBackdrop');
    this.tbody = this.container.querySelector('.score-tbody');
    this.closeBtn = this.container.querySelector('.modal-close');

    this.closeBtn.addEventListener('click', () => this.hide());
  }

  /**
   * Show modal
   */
  show() {
    this.backdrop.classList.add('open');
    this.isVisible = true;
    this.renderScores();
  }

  /**
   * Hide modal
   */
  hide() {
    this.backdrop.classList.remove('open');
    this.isVisible = false;
  }

  /**
   * Render scores
   */
  renderScores() {
    if (!this.scores || Object.keys(this.scores).length === 0) {
      this.tbody.innerHTML = '<tr><td colspan="3">No scores available</td></tr>';
      return;
    }

    const rows = Object.entries(this.scores).map(([playerId, scoreData]) => `
      <tr>
        <td>${scoreData.name}</td>
        <td class="${scoreData.totalScore >= 0 ? 'positive' : 'negative'}">
          ${scoreData.roundScore >= 0 ? '+' : ''}${scoreData.roundScore}
        </td>
        <td class="total-score">${scoreData.totalScore}</td>
      </tr>
    `).join('');

    this.tbody.innerHTML = rows;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}