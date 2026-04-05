/**
 * Main application script
 */

// Modal Management
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
  }
}

// Initialize modals
function initModals() {
  // Open triggers
  document.getElementById('createRoomBtn')?.addEventListener('click', () => openModal('createRoomModal'));
  document.getElementById('joinRoomBtn')?.addEventListener('click', () => openModal('joinRoomModal'));

  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Click backdrop to close
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Toggle group
  document.querySelectorAll('.toggle-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.toggle-group').querySelectorAll('.toggle-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Profile dropdown
function initProfileDropdown() {
  const chip = document.getElementById('profileChip');
  const dropdown = document.getElementById('profileDropdown');
  if (!chip) return;

  chip.addEventListener('click', e => {
    e.stopPropagation();
    chip.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    chip.classList.remove('open');
  });
}

// Background canvas
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const SUITS = ['♠', '♥', '♦', '♣'];
  const particles = Array.from({ length: 22 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    suit: SUITS[Math.floor(Math.random() * 4)],
    size: Math.random() * 14 + 8,
    speed: Math.random() * 0.18 + 0.06,
    alpha: Math.random() * 0.04 + 0.01,
    drift: (Math.random() - 0.5) * 0.3,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75
    );
    grad.addColorStop(0, 'rgba(26,20,16,0)');
    grad.addColorStop(0.6, 'rgba(12,9,5,0.2)');
    grad.addColorStop(1, 'rgba(8,5,2,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '16px serif';
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#c9993a';
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.suit, p.x, p.y);

      p.y -= p.speed;
      p.x += p.drift;

      if (p.y < -40) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20 || p.x > canvas.width + 20) {
        p.x = Math.random() * canvas.width;
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

// Entrance animations
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  elements.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('in-view'), delay);
  });
}

// Play button handlers
function initPlayButtons() {
  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const modeLabel = document.getElementById('mmMode');
      const timer = document.getElementById('mmTimer');

      if (modeLabel) modeLabel.textContent = mode === 'ranked' ? 'Ranked Play' : 'Casual Play';
      if (timer) timer.textContent = '0:00';

      openModal('matchmakingModal');

      let mmSeconds = 0;
      const mmInterval = setInterval(() => {
        mmSeconds++;
        const m = Math.floor(mmSeconds / 60);
        const s = String(mmSeconds % 60).padStart(2, '0');
        if (timer) timer.textContent = `${m}:${s}`;

        if (mmSeconds >= Math.floor(Math.random() * 8) + 5) {
          clearInterval(mmInterval);
          closeModal('matchmakingModal');
          alert(`Match found! Starting ${mode} game…`);
        }
      }, 1000);

      document.getElementById('cancelMatchBtn')?.addEventListener('click', () => {
        clearInterval(mmInterval);
        closeModal('matchmakingModal');
      });
    });
  });
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initProfileDropdown();
  initModals();
  initPlayButtons();
  initAnimations();
});

// ========== Game Flow Integration ==========

// Update play button handlers to work with auth
function initPlayButtons() {
  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!window.client.isAuthenticated()) {
        alert('Please log in first!');
        // Show login modal (you'll need to add this)
        return;
      }

      const mode = btn.dataset.mode;
      const modeLabel = document.getElementById('mmMode');
      const timer = document.getElementById('mmTimer');

      if (modeLabel) modeLabel.textContent = mode === 'ranked' ? 'Ranked Play' : 'Casual Play';
      if (timer) timer.textContent = '0:00';

      openModal('matchmakingModal');

      let mmSeconds = 0;
      const mmInterval = setInterval(() => {
        mmSeconds++;
        const m = Math.floor(mmSeconds / 60);
        const s = String(mmSeconds % 60).padStart(2, '0');
        if (timer) timer.textContent = `${m}:${s}`;

        if (mmSeconds >= Math.floor(Math.random() * 8) + 5) {
          clearInterval(mmInterval);
          closeModal('matchmakingModal');
          
          // Create a room
          createGameRoom(mode);
        }
      }, 1000);

      document.getElementById('cancelMatchBtn')?.addEventListener('click', () => {
        clearInterval(mmInterval);
        closeModal('matchmakingModal');
      });
    });
  });
}

// Create a game room
async function createGameRoom(mode) {
  try {
    const roomConfig = {
      mode: mode,
      maxPlayers: 2,
      isPrivate: false,
      hostName: window.client.user.username,
    };

    const result = await window.client.createRoom(roomConfig);
    alert(`Room created! ID: ${result.roomId}\nShare this with another player to join.`);
  } catch (error) {
    alert(`Error creating room: ${error.message}`);
  }
}

// Update create room button
const createRoomBtn = document.getElementById('createRoomBtn');
if (createRoomBtn) {
  createRoomBtn.addEventListener('click', async () => {
    if (!window.client.isAuthenticated()) {
      alert('Please log in first!');
      return;
    }

    const roomName = prompt('Enter room name:');
    const maxPlayers = prompt('Max players (2-6):', '4');

    if (!roomName) return;

    try {
      const roomConfig = {
        mode: 'casual',
        maxPlayers: parseInt(maxPlayers),
        isPrivate: false,
      };

      const result = await window.client.createRoom(roomConfig);
      alert(`✓ Room created!\nID: ${result.roomId}`);
    } catch (error) {
      alert(`✗ Error: ${error.message}`);
    }
  });
}

// Update join room button
const joinRoomBtn = document.getElementById('joinRoomBtn');
if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', async () => {
    if (!window.client.isAuthenticated()) {
      alert('Please log in first!');
      return;
    }

    const roomId = prompt('Enter room ID:');
    if (!roomId) return;

    try {
      const result = await window.client.joinRoom(roomId, window.client.user.username);
      alert(`✓ Joined room!\nPlayers: ${result.playerCount}`);
    } catch (error) {
      alert(`✗ Error: ${error.message}`);
    }
  });
}