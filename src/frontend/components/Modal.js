/**
 * Generic modal component
 */

export class Modal {
  constructor(options = {}) {
    this.options = {
      title: 'Modal',
      content: '',
      buttons: [],
      onClose: null,
      size: 'md', // sm, md, lg
      closeOnBackdrop: true,
      closeOnEscape: true,
      ...options,
    };

    this.isOpen = false;
    this.setupDOM();
  }

  /**
   * Setup DOM
   */
  setupDOM() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';

    this.modal = document.createElement('div');
    this.modal.className = `modal modal-${this.options.size}`;

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h2 class="modal-title">${this.options.title}</h2>
      <button class="modal-close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = this.options.content;

    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    footer.innerHTML = this.options.buttons.map(btn => `
      <button class="btn-${btn.style || 'secondary'}" data-action="${btn.action}">
        ${btn.text}
      </button>
    `).join('');

    this.modal.appendChild(header);
    this.modal.appendChild(body);
    if (this.options.buttons.length > 0) {
      this.modal.appendChild(footer);
    }

    this.backdrop.appendChild(this.modal);

    // Event listeners
    const closeBtn = header.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.close());

    if (this.options.closeOnBackdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    footer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const action = btn.dataset.action;
        this.handleButtonClick(action);
      }
    });
  }

  /**
   * Open modal
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    document.body.appendChild(this.backdrop);

    // Trigger open animation
    setTimeout(() => {
      this.backdrop.classList.add('open');
    }, 10);
  }

  /**
   * Close modal
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.backdrop.classList.remove('open');

    setTimeout(() => {
      this.backdrop.remove();
      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 250);
  }

  /**
   * Handle button click
   */
  handleButtonClick(action) {
    const button = this.options.buttons.find(btn => btn.action === action);
    if (button && button.onClick) {
      button.onClick();
    }
  }

  /**
   * Update content
   */
  updateContent(content) {
    const body = this.modal.querySelector('.modal-body');
    body.innerHTML = content;
  }

  /**
   * Get element
   */
  getElement() {
    return this.backdrop;
  }

  /**
   * Destroy
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }
  }
}