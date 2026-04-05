/**
 * Display formatting utilities
 */

export function formatScore(score) {
  return new Intl.NumberFormat('en-US').format(score);
}

export function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return '0%';
  return Math.round((wins / total) * 100) + '%';
}

export function formatPlayerName(name) {
  return name.length > 15 ? name.substring(0, 12) + '...' : name;
}

export function formatCardCount(count) {
  return count === 1 ? '1 card' : `${count} cards`;
}

export function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}