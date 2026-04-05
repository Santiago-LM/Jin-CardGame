/**
 * JIN celebration animation component
 */

import { CardAnimationService } from '../services/CardAnimationService.js';

export class JINAnimation {
  constructor(container) {
    this.container = container;
    this.isPlaying = false;

    this.setupDOM();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.container.innerHTML = `
      <div class="jin-animation-wrapper" style="display: none;">
        <div class="jin-celebration">
          <div class="jin-text">JIN!</div>
          <div class="jin-particles"></div>
          <div class="jin-glow"></div>
        </div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.jin-animation-wrapper');
    this.celebration = this.container.querySelector('.jin-celebration');
    this.particles = this.container.querySelector('.jin-particles');
  }

  /**
   * Play JIN animation
   */
  async play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.wrapper.style.display = 'flex';

    // Main celebration animation
    await CardAnimationService.animateJINCelebration(this.celebration, 1500);

    // Create particle effects
    this.createParticles();

    // Hide after animation
    setTimeout(() => {
      this.wrapper.style.display = 'none';
      this.isPlaying = false;
    }, 2000);
  }

  /**
   * Create particle effects
   */
  createParticles() {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'jin-particle';

      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 100 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, #f0b429, #c8880a);
        border-radius: 50%;
        opacity: 1;
        transform: translate(${x}px, ${y}px);
        animation: jin-particle-float 1.5s ease-out forwards;
      `;

      this.particles.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }
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