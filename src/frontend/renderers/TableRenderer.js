/**
 * 3D table rendering (using Canvas 2D with perspective transforms)
 */

export class TableRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.players = [];
    this.communityPile = [];
    this.animationFrameId = null;
    this.rotation = 0;
  }

  /**
   * Initialize renderer
   */
  init() {
    this.setupCanvas();
    this.drawTable();
  }

  /**
   * Setup canvas
   */
  setupCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Set up 2D context
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Resize canvas
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.drawTable();
  }

  /**
   * Draw table
   */
  drawTable() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = 200;

    // Background
    this.ctx.fillStyle = '#1a0f0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Table rim (outer circle)
    this.ctx.fillStyle = '#6b3a1f';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Table felt (inner circle)
    const gradient = this.ctx.createRadialGradient(centerX - 30, centerY - 30, 0, centerX, centerY, radius - 30);
    gradient.addColorStop(0, '#3d9a70');
    gradient.addColorStop(1, '#1a5233');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw chairs around table
    this.drawChairs(centerX, centerY, radius + 30);

    // Draw community pile in center
    this.drawCommunityPile(centerX, centerY);

    // Draw player positions
    this.drawPlayerPositions(centerX, centerY, radius);
  }

  /**
   * Draw chairs around table
   */
  drawChairs(centerX, centerY, radius) {
    const chairCount = 6;
    const chairWidth = 50;
    const chairHeight = 40;

    for (let i = 0; i < chairCount; i++) {
      const angle = (i * Math.PI * 2) / chairCount - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Chair base
      this.ctx.fillStyle = '#6b3e1a';
      this.ctx.fillRect(x - chairWidth / 2, y - chairHeight / 2, chairWidth, chairHeight);

      // Chair seat
      this.ctx.fillStyle = '#7a4820';
      this.ctx.fillRect(x - chairWidth / 2 + 5, y - chairHeight / 2 + 8, chairWidth - 10, chairHeight - 16);
    }
  }

  /**
   * Draw community pile in center
   */
  drawCommunityPile(centerX, centerY) {
    const pileWidth = 60;
    const pileHeight = 84;

    // Draw cards stacked
    for (let i = 0; i < Math.min(this.communityPile.length, 3); i++) {
      const offsetX = i * 3;
      const offsetY = i * 2;

      this.ctx.fillStyle = '#2a2a96';
      this.ctx.fillRect(
        centerX - pileWidth / 2 + offsetX,
        centerY - pileHeight / 2 + offsetY,
        pileWidth,
        pileHeight
      );

      this.ctx.strokeStyle = '#1a1a70';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        centerX - pileWidth / 2 + offsetX,
        centerY - pileHeight / 2 + offsetY,
        pileWidth,
        pileHeight
      );
    }

    // Pile count
    this.ctx.fillStyle = '#e8dcc8';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.communityPile.length, centerX, centerY);
  }

  /**
   * Draw player positions
   */
  drawPlayerPositions(centerX, centerY, radius) {
    const chairCount = 6;

    for (let i = 0; i < this.players.length && i < chairCount; i++) {
      const angle = (i * Math.PI * 2) / chairCount - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const player = this.players[i];

      // Player avatar
      this.ctx.fillStyle = '#f0b429';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 25, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(player.name.substring(0, 2).toUpperCase(), x, y);

      // Player name
      this.ctx.fillStyle = '#e8dcc8';
      this.ctx.font = '11px Arial';
      this.ctx.fillText(player.name, x, y + 40);

      // Player score
      this.ctx.fillStyle = '#f0b429';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(player.totalScore.toString(), x, y + 55);
    }
  }

  /**
   * Update players
   */
  updatePlayers(players) {
    this.players = players;
    this.drawTable();
  }

  /**
   * Update community pile
   */
  updateCommunityPile(pile) {
    this.communityPile = pile;
    this.drawTable();
  }

  /**
   * Animate
   */
  animate() {
    this.rotation += 0.0005;
    this.drawTable();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Dispose
   */
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}