/**
 * Storage Service - Static methods for localStorage/sessionStorage
 */

export class StorageService {
  static PREFIX = 'regalem_';

  static save(key, value) {
    try {
      localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`${this.PREFIX}${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static clear() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static setToken(token) {
    this.save('token', token);
  }

  static getToken() {
    return this.load('token');
  }

  static setUser(user) {
    this.save('user', user);
  }

  static getUser() {
    return this.load('user');
  }

  static clearAuth() {
    this.remove('token');
    this.remove('user');
  }
}