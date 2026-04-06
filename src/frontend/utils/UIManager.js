/**
 * UIManager — Centralized UI update logic for the home/dashboard page.
 */

export class UIManager {
  /**
   * Update all profile-related DOM elements with user data.
   * @param {Object} user - User object from StorageService
   */
  static updateUserProfile(user) {
    if (!user) return;

    const initials = (user.username || 'U').substring(0, 2).toUpperCase();
    const rating = user.totalScore || 0;
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const total = wins + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const rank = UIManager.getRank(rating);

    UIManager._set('userAvatar', initials);
    UIManager._set('chipAvatar', initials);
    UIManager._set('dropdownAvatar', initials);
    UIManager._set('lbUserAvatar', initials);

    UIManager._set('userName', user.username);
    UIManager._set('chipName', user.username);
    UIManager._set('dropdownName', user.username);
    UIManager._set('lbUserName', `${user.username} (you)`);
    UIManager._set('dropdownEmail', user.email || '');

    UIManager._set('heroGreeting', `Welcome back, ${user.username}`);

    UIManager._set('userRatingVal', rating.toLocaleString());
    UIManager._set('lbUserRating', rating.toLocaleString());
    UIManager._set('userWinsVal', wins);
    UIManager._set('userWinRateVal', `${winRate}%`);

    UIManager._set('chipRank', rank);
    UIManager._set('userRankLabel', rank);

    const nextRankThreshold = 10000;
    const xpPercent = Math.min((rating / nextRankThreshold) * 100, 100);
    UIManager._setStyle('xpBar', 'width', `${xpPercent}%`);
    UIManager._set('xpProgress', `${rating} / ${nextRankThreshold.toLocaleString()}`);
  }

  /**
   * Map a numeric score to a rank label.
   * @param {number} score
   * @returns {string}
   */
  static getRank(score) {
    if (score >= 3000) return 'Diamond';
    if (score >= 2500) return 'Platinum';
    if (score >= 2000) return 'Gold';
    if (score >= 1500) return 'Silver';
    if (score >= 1000) return 'Bronze';
    return 'Unranked';
  }

  /**
   * Show or hide the authenticated vs. guest sections.
   * @param {boolean} authenticated
   */
  static toggleAuthSections(authenticated) {
    const authSection = document.getElementById('authSection');
    const userSection = document.getElementById('userSection');
    if (authSection) authSection.style.display = authenticated ? 'none' : 'block';
    if (userSection) userSection.style.display = authenticated ? 'block' : 'none';
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  static _set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  static _setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }
}
