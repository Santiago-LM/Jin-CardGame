/**
 * Local/Session storage service
 */

export class StorageService {
  static PREFIX = 'regalem_';

  /**
   * Save to localStorage
   */
  static save(key, value) {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(`${this.PREFIX}${key}`, data);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  /**
   * Load from localStorage
   */
  static load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`${this.PREFIX}${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove from localStorage
   */
  static remove(key) {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  /**
   * Clear all stored data
   */
  static clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  /**
   * Session storage methods
   */
  static saveSession(key, value) {
    try {
      const data = JSON.stringify(value);
      sessionStorage.setItem(`${this.PREFIX}${key}`, data);
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }

  static loadSession(key, defaultValue = null) {
    try {
      const data = sessionStorage.getItem(`${this.PREFIX}${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Session storage error:', error);
      return defaultValue;
    }
  }

  static removeSession(key) {
    try {
      sessionStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }

  /**
   * Get user preferences
   */
  static getUserPreferences() {
    return this.load('userPreferences', {
      soundEnabled: true,
      animationsEnabled: true,
      volume: 0.5,
      theme: 'dark',
      sortCardsBy: 'default',
    });
  }

  /**
   * Save user preferences
   */
  static saveUserPreferences(prefs) {
    this.save('userPreferences', prefs);
  }

  /**
   * Get game cache
   */
  static getGameCache(gameId) {
    return this.loadSession(`game_${gameId}`, null);
  }

  /**
   * Save game cache
   */
  static saveGameCache(gameId, data) {
    this.saveSession(`game_${gameId}`, data);
  }

  /**
   * Clear game cache
   */
  static clearGameCache(gameId) {
    this.removeSession(`game_${gameId}`);
  }
}