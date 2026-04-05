/**
 * Debug logging utility
 */

export class Logger {
  static DEBUG = 'DEBUG';
  static INFO = 'INFO';
  static WARN = 'WARN';
  static ERROR = 'ERROR';

  static level = 'DEBUG'; // Set minimum log level

  static setLevel(level) {
    this.level = level;
  }

  static debug(message, data) {
    if (this.shouldLog(this.DEBUG)) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static info(message, data) {
    if (this.shouldLog(this.INFO)) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  static warn(message, data) {
    if (this.shouldLog(this.WARN)) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  static error(message, error) {
    if (this.shouldLog(this.ERROR)) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  static shouldLog(level) {
    const levels = [this.DEBUG, this.INFO, this.WARN, this.ERROR];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  static group(label) {
    console.group(label);
  }

  static groupEnd() {
    console.groupEnd();
  }

  static time(label) {
    console.time(label);
  }

  static timeEnd(label) {
    console.timeEnd(label);
  }

  static table(data) {
    console.table(data);
  }
}