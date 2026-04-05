/**
 * Frontend card utilities
 */

export function createCard(rank, suit, id) {
  return { id, rank, suit };
}

export function findCardById(cards, cardId) {
  return cards.find(c => c.id === cardId);
}

export function removeCardById(cards, cardId) {
  return cards.filter(c => c.id !== cardId);
}

export function getSuitSymbol(suit) {
  const symbols = {
    'HEARTS': '♥',
    'DIAMONDS': '♦',
    'CLUBS': '♣',
    'SPADES': '♠',
  };
  return symbols[suit] || '';
}

export function formatCard(card) {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}

export function isWildcard(card) {
  return card.rank === 'JOKER' || card.rank === '2';
}

export function getCardColor(suit) {
  const colors = {
    'HEARTS': '#e05252',
    'DIAMONDS': '#e05252',
    'CLUBS': '#2d5a3d',
    'SPADES': '#333',
  };
  return colors[suit] || '#666';
}

export function sortCardsByRank(cards) {
  const rankOrder = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7,
    '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, 'JOKER': 0,
  };
  return [...cards].sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank]);
}

export function sortCardsBySuit(cards) {
  const suitOrder = { 'SPADES': 0, 'HEARTS': 1, 'DIAMONDS': 2, 'CLUBS': 3 };
  return [...cards].sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit]);
}

export function groupCardsByRank(cards) {
  const groups = {};
  cards.forEach(card => {
    if (!groups[card.rank]) {
      groups[card.rank] = [];
    }
    groups[card.rank].push(card);
  });
  return groups;
}

export function groupCardsBySuit(cards) {
  const groups = {};
  cards.forEach(card => {
    if (!groups[card.suit]) {
      groups[card.suit] = [];
    }
    groups[card.suit].push(card);
  });
  return groups;
}