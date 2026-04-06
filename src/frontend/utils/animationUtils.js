/**
 * Animation utilities — triggers CSS entrance animations
 */

/**
 * Trigger entrance animations for elements with [data-animate] attribute.
 * Reads [data-delay] (ms) to stagger each element.
 */
export function triggerEntranceAnimations() {
  document.querySelectorAll('[data-animate]').forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('in-view'), delay);
  });
}

/**
 * Remove in-view class to reset animations (e.g. for re-entry).
 */
export function resetAnimations() {
  document.querySelectorAll('[data-animate].in-view').forEach(el => {
    el.classList.remove('in-view');
  });
}
