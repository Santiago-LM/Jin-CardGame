// Home page initialization
import HomePage from './pages/HomePage.js';
import './services/WebSocketClient.js'; // Optional: pre-connect

document.addEventListener('DOMContentLoaded', () => {
  const homePage = new HomePage();
  homePage.init();
});/**
 * Home page initialization
 */

import { HomePage } from './pages/HomePage.js';

document.addEventListener('DOMContentLoaded', () => {
  const homePage = new HomePage();
  homePage.init();
});