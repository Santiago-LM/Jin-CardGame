/**
 * Card animation service using CSS animations
 */

export class CardAnimationService {
  /**
   * Animate card deal from deck
   */
  static animateCardDeal(cardElement, fromElement, toElement, duration = 600) {
    return new Promise((resolve) => {
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      const offsetX = fromRect.left - toRect.left;
      const offsetY = fromRect.top - toRect.top;

      cardElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      cardElement.style.transition = 'none';

      // Force reflow
      cardElement.offsetHeight;

      cardElement.style.transform = 'translate(0, 0)';
      cardElement.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

      setTimeout(() => {
        cardElement.style.transition = 'none';
        resolve();
      }, duration);
    });
  }

  /**
   * Animate card play to center
   */
  static animateCardPlay(cardElement, duration = 400) {
    return new Promise((resolve) => {
      cardElement.classList.add('card-playing');
      cardElement.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      cardElement.style.transform = 'scale(1.2) translateY(-50px)';
      cardElement.style.opacity = '0.8';

      setTimeout(() => {
        cardElement.classList.remove('card-playing');
        cardElement.style.opacity = '1';
        resolve();
      }, duration);
    });
  }

  /**
   * Animate card discard to pile
   */
  static animateCardDiscard(cardElement, pileElement, duration = 400) {
    return new Promise((resolve) => {
      const cardRect = cardElement.getBoundingClientRect();
      const pileRect = pileElement.getBoundingClientRect();

      const offsetX = pileRect.left - cardRect.left;
      const offsetY = pileRect.top - cardRect.top;

      cardElement.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      cardElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.8)`;
      cardElement.style.opacity = '0.5';

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * Animate card selection
   */
  static animateCardSelect(cardElement, duration = 150) {
    cardElement.style.transition = `all ${duration}ms ease`;
    cardElement.style.transform = 'translateY(-10px) scale(1.05)';

    setTimeout(() => {
      cardElement.style.transition = 'none';
    }, duration);
  }

  /**
   * Animate card deselection
   */
  static animateCardDeselect(cardElement, duration = 150) {
    cardElement.style.transition = `all ${duration}ms ease`;
    cardElement.style.transform = 'translateY(0) scale(1)';

    setTimeout(() => {
      cardElement.style.transition = 'none';
    }, duration);
  }

  /**
   * Animate card rejection
   */
  static animateCardRejection(cardElement, duration = 400) {
    return new Promise((resolve) => {
      cardElement.style.transition = `all ${duration}ms ease`;
      cardElement.style.transform = 'translateX(-20px)';
      cardElement.style.opacity = '0.3';

      setTimeout(() => {
        cardElement.style.transform = 'translateX(0)';
        cardElement.style.opacity = '1';
        resolve();
      }, duration / 2);
    });
  }

  /**
   * Animate JIN celebration
   */
  static animateJINCelebration(element, duration = 1500) {
    return new Promise((resolve) => {
      const keyframes = [
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(1.2) rotate(-5deg)', opacity: 1, offset: 0.25 },
        { transform: 'scale(1.3) rotate(5deg)', opacity: 1, offset: 0.5 },
        { transform: 'scale(1.2) rotate(-5deg)', opacity: 1, offset: 0.75 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ];

      element.animate(keyframes, {
        duration,
        easing: 'ease-in-out',
        fill: 'forwards',
      });

      setTimeout(resolve, duration);
    });
  }

  /**
   * Animate points popup
   */
  static animatePointsPopup(element, points, duration = 1000) {
    return new Promise((resolve) => {
      const text = `+${points}`;
      element.textContent = text;
      element.classList.add('points-popup');
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      element.style.transition = `all ${duration}ms ease`;

      setTimeout(() => {
        element.style.transform = 'translateY(-50px)';
        element.style.opacity = '0';
        setTimeout(() => {
          element.classList.remove('points-popup');
          resolve();
        }, duration);
      }, 100);
    });
  }

  /**
   * Animate shake (error)
   */
  static animateShake(element, duration = 400) {
    return new Promise((resolve) => {
      const keyframes = [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' },
      ];

      element.animate(keyframes, {
        duration,
        easing: 'ease-in-out',
      });

      setTimeout(resolve, duration);
    });
  }

  /**
   * Pulse animation
   */
  static animatePulse(element, duration = 600) {
    element.style.animation = `pulse ${duration}ms ease-in-out`;
  }

  /**
   * Fade in
   */
  static animateFadeIn(element, duration = 300) {
    element.style.animation = `fadeIn ${duration}ms ease-in-out forwards`;
  }

  /**
   * Fade out
   */
  static animateFadeOut(element, duration = 300) {
    element.style.animation = `fadeOut ${duration}ms ease-in-out forwards`;
  }
}