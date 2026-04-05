/**
 * Card visual rendering utilities
 */

export class CardRenderer {
  /**
   * Create SVG card
   */
  static createCardSVG(rank, suit) {
    const suits = {
      'HEARTS': { symbol: '♥', color: '#e05252' },
      'DIAMONDS': { symbol: '♦', color: '#e05252' },
      'CLUBS': { symbol: '♣', color: '#000' },
      'SPADES': { symbol: '♠', color: '#000' },
    };

    const suitInfo = suits[suit] || { symbol: '?', color: '#000' };

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 140');
    svg.setAttribute('class', 'card-svg');

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100');
    bg.setAttribute('height', '140');
    bg.setAttribute('fill', '#fff');
    bg.setAttribute('stroke', '#333');
    bg.setAttribute('stroke-width', '2');
    bg.setAttribute('rx', '5');
    svg.appendChild(bg);

    // Rank
    const rankText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    rankText.setAttribute('x', '10');
    rankText.setAttribute('y', '20');
    rankText.setAttribute('font-size', '16');
    rankText.setAttribute('font-weight', 'bold');
    rankText.setAttribute('fill', suitInfo.color);
    rankText.textContent = rank;
    svg.appendChild(rankText);

    // Suit
    const suitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    suitText.setAttribute('x', '50%');
    suitText.setAttribute('y', '50%');
    suitText.setAttribute('font-size', '40');
    suitText.setAttribute('text-anchor', 'middle');
    suitText.setAttribute('dominant-baseline', 'middle');
    suitText.setAttribute('fill', suitInfo.color);
    suitText.textContent = suitInfo.symbol;
    svg.appendChild(suitText);

    return svg;
  }

  /**
   * Render card to canvas
   */
  static renderCardToCanvas(ctx, rank, suit, x, y, width = 80, height = 120) {
    const suits = {
      'HEARTS': { symbol: '♥', color: '#e05252' },
      'DIAMONDS': { symbol: '♦', color: '#e05252' },
      'CLUBS': { symbol: '♣', color: '#000' },
      'SPADES': { symbol: '♠', color: '#000' },
    };

    const suitInfo = suits[suit] || { symbol: '?', color: '#000' };

    // Background
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 5);
    ctx.fill();
    ctx.stroke();

    // Rank
    ctx.fillStyle = suitInfo.color;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(rank, x + 8, y + 16);

    // Suit (center)
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suitInfo.symbol, x + width / 2, y + height / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  /**
   * Get card color
   */
  static getCardColor(suit) {
    const colors = {
      'HEARTS': '#e05252',
      'DIAMONDS': '#e05252',
      'CLUBS': '#2d5a3d',
      'SPADES': '#333',
    };
    return colors[suit] || '#666';
  }

  /**
   * Get card background
   */
  static getCardBackground(rank, suit) {
    const isRed = ['HEARTS', 'DIAMONDS'].includes(suit);
    return isRed ? '#ffebee' : '#f5f5f5';
  }

  /**
   * Format card display
   */
  static formatCard(rank, suit) {
    const suits = {
      'HEARTS': '♥',
      'DIAMONDS': '♦',
      'CLUBS': '♣',
      'SPADES': '♠',
    };
    return `${rank}${suits[suit] || ''}`;
  }
}