/**
 * Regalem — Home Page Entry Point
 * Initializes the RegalemClient and wires up event-driven UI updates.
 */

import { RegalemClient } from './services/RegalemClient.js';
import { StorageService } from './services/StorageService.js';
import { UIManager } from './utils/UIManager.js';
import { triggerEntranceAnimations } from './utils/animationUtils.js';
import { Logger } from './utils/logger.js';

Logger.setLevel('INFO');

// Expose a single global app instance for cross-component communication
const client = new RegalemClient();

window.regalem = {
  client,
  api: client.api,
  socket: client.socket,
  state: client,
  storage: StorageService,
  logger: Logger,
};

document.addEventListener('DOMContentLoaded', async () => {
  Logger.info('🎴 Regalem Home Page Loading...');

  try {
    if (!client.isAuthenticated()) {
      Logger.info('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }

    Logger.info(`✓ User authenticated: ${client.user.username}`);
    client.connectSocket();
    UIManager.updateUserProfile(client.user);

    // Wire up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          client.logout();
          Logger.info('✓ Logged out');
          window.location.href = '/login';
        }
      });
    }

    // Profile dropdown toggle
    const profileChip = document.getElementById('profileChip');
    if (profileChip) {
      profileChip.addEventListener('click', (e) => {
        e.stopPropagation();
        profileChip.classList.toggle('open');
      });
      document.addEventListener('click', () => profileChip.classList.remove('open'));
    }

    // Trigger entrance animations after UI is ready
    triggerEntranceAnimations();

    Logger.info('✓ Home page initialized');
  } catch (error) {
    Logger.error('Page initialization failed', error);
  }
});