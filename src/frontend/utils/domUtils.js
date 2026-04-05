/**
 * DOM manipulation utilities
 */

export function createElement(tag, className = '', innerHTML = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

export function setAttributes(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

export function addClass(element, className) {
  element.classList.add(className);
}

export function removeClass(element, className) {
  element.classList.remove(className);
}

export function toggleClass(element, className) {
  element.classList.toggle(className);
}

export function hasClass(element, className) {
  return element.classList.contains(className);
}

export function getRect(element) {
  return element.getBoundingClientRect();
}

export function isInViewport(element) {
  const rect = getRect(element);
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function scrollIntoView(element, behavior = 'smooth') {
  element.scrollIntoView({ behavior });
}

export function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function delegate(parent, selector, event, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target) {
      handler.call(target, e);
    }
  });
}

export function on(element, event, handler) {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
}

export function once(element, event, handler) {
  const wrapper = (e) => {
    handler(e);
    element.removeEventListener(event, wrapper);
  };
  element.addEventListener(event, wrapper);
}

export function emitEvent(element, eventName, detail = {}) {
  const event = new CustomEvent(eventName, { detail, bubbles: true });
  element.dispatchEvent(event);
}