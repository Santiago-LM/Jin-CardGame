/**
 * Sound effects service
 */

export class SoundService {
  constructor() {
    this.sounds = new Map();
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;

    this.initAudioContext();
    this.loadSounds();
  }

  /**
   * Initialize audio context
   */
  initAudioContext() {
    const audioContextClass = window.AudioContext || window.webkitAudioContext;
    if (audioContextClass) {
      this.audioContext = new audioContextClass();
    }
  }

  /**
   * Load sound files
   */
  loadSounds() {
    const soundList = [
      'card-play',
      'card-deal',
      'card-draw',
      'card-discard',
      'pile-steal',
      'jin-victory',
      'round-end',
      'move-invalid',
      'turn-start',
      'game-end',
      'button-click',
    ];

    soundList.forEach(soundName => {
      const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
      audio.volume = this.volume;
      this.sounds.set(soundName, audio);
    });
  }

  /**
   * Play sound
   */
  play(soundName) {
    if (!this.enabled) return;

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(error => {
      console.warn(`Could not play sound ${soundName}:`, error);
    });
  }

  /**
   * Play card-specific sounds
   */
  playCardPlay() {
    this.play('card-play');
  }

  playCardDeal() {
    this.play('card-deal');
  }

  playCardDraw() {
    this.play('card-draw');
  }

  playCardDiscard() {
    this.play('card-discard');
  }

  playSteal() {
    this.play('pile-steal');
  }

  playJIN() {
    this.play('jin-victory');
  }

  playRoundEnd() {
    this.play('round-end');
  }

  playInvalidMove() {
    this.play('move-invalid');
  }

  playTurnStart() {
    this.play('turn-start');
  }

  playGameEnd() {
    this.play('game-end');
  }

  playButtonClick() {
    this.play('button-click');
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /**
   * Toggle sound
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Mute all sounds
   */
  mute() {
    this.enabled = false;
  }

  /**
   * Unmute all sounds
   */
  unmute() {
    this.enabled = true;
  }
}