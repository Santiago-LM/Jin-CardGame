/**
 * Pub/sub event system for loosely coupled components
 */

export class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to event
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Emit event with data
   */
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to event, auto-unsubscribe after first trigger
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      callback(data);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Remove all listeners for event
   */
  off(eventName) {
    delete this.events[eventName];
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = {};
  }
}