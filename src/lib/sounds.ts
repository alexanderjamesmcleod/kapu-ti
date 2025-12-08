/**
 * Game Sound Effects for Kapu Tī
 * Uses Web Audio API to synthesize sounds - no external files needed
 */

type SoundType =
  | 'timerTick'       // Every second at ≤10s
  | 'timerUrgent'     // At ≤5s - more urgent
  | 'timerExpired'    // Time ran out
  | 'cardPlay'        // Card placed on table
  | 'cardPickup'      // Card returned to hand
  | 'turnStart'       // Your turn starts
  | 'voteSubmit'      // Vote button clicked
  | 'voteApproved'    // Majority approved
  | 'voteRejected'    // Majority rejected
  | 'gameStart'       // Game begins
  | 'playerJoin'      // New player joined
  | 'topicSelect';    // Topic was selected

// Sound settings (persisted to localStorage)
interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

const STORAGE_KEY = 'kaputi_sound_settings';

// Singleton AudioContext (created on first user interaction)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }

  // Resume if suspended (required after page load until user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Get settings from localStorage
function getSettings(): SoundSettings {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.5 };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse errors
  }

  return { enabled: true, volume: 0.5 };
}

// Save settings to localStorage
function saveSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Play a game sound effect
 */
export function playSound(type: SoundType): void {
  const settings = getSettings();
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (type) {
    case 'timerTick':
      playTick(ctx, now, settings.volume * 0.3);
      break;
    case 'timerUrgent':
      playUrgentTick(ctx, now, settings.volume * 0.5);
      break;
    case 'timerExpired':
      playBuzz(ctx, now, settings.volume * 0.4);
      break;
    case 'cardPlay':
      playCardPlay(ctx, now, settings.volume * 0.4);
      break;
    case 'cardPickup':
      playCardPickup(ctx, now, settings.volume * 0.3);
      break;
    case 'turnStart':
      playTurnStart(ctx, now, settings.volume * 0.5);
      break;
    case 'voteSubmit':
      playVoteSubmit(ctx, now, settings.volume * 0.4);
      break;
    case 'voteApproved':
      playApproved(ctx, now, settings.volume * 0.5);
      break;
    case 'voteRejected':
      playRejected(ctx, now, settings.volume * 0.5);
      break;
    case 'gameStart':
      playGameStart(ctx, now, settings.volume * 0.5);
      break;
    case 'playerJoin':
      playPlayerJoin(ctx, now, settings.volume * 0.4);
      break;
    case 'topicSelect':
      playTopicSelect(ctx, now, settings.volume * 0.4);
      break;
  }
}

// ===== Sound Generators =====

// Simple tick - short beep
function playTick(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 800;

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

// Urgent tick - double beep, higher pitch
function playUrgentTick(ctx: AudioContext, time: number, volume: number): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.value = 1000;
  osc2.type = 'sine';
  osc2.frequency.value = 1200;

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc1.stop(time + 0.04);
  osc2.start(time + 0.05);
  osc2.stop(time + 0.08);
}

// Buzz - time expired
function playBuzz(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = 200;

  gain.gain.setValueAtTime(volume, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.3);
}

// Card play - soft thud
function playCardPlay(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, time);
  osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.15);
}

// Card pickup - soft whoosh
function playCardPickup(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, time);
  osc.frequency.exponentialRampToValueAtTime(400, time + 0.1);

  gain.gain.setValueAtTime(volume * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

// Turn start - attention chime
function playTurnStart(ctx: AudioContext, time: number, volume: number): void {
  const notes = [523, 659, 784]; // C5, E5, G5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const noteTime = time + i * 0.08;
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(volume, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.2);
  });
}

// Vote submit - click
function playVoteSubmit(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 600;

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.08);
}

// Approved - happy ascending arpeggio
function playApproved(ctx: AudioContext, time: number, volume: number): void {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const noteTime = time + i * 0.1;
    gain.gain.setValueAtTime(volume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.25);
  });
}

// Rejected - sad descending notes
function playRejected(ctx: AudioContext, time: number, volume: number): void {
  const notes = [392, 330, 262]; // G4, E4, C4

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    const noteTime = time + i * 0.15;
    gain.gain.setValueAtTime(volume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.3);
  });
}

// Game start - fanfare
function playGameStart(ctx: AudioContext, time: number, volume: number): void {
  const notes = [392, 523, 659, 784, 1047]; // G4, C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const noteTime = time + i * 0.08;
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(volume * 0.8, noteTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.3);
  });
}

// Player join - welcome chime
function playPlayerJoin(ctx: AudioContext, time: number, volume: number): void {
  const notes = [659, 784]; // E5, G5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const noteTime = time + i * 0.1;
    gain.gain.setValueAtTime(volume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.2);
  });
}

// Topic select - selection confirm
function playTopicSelect(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, time);
  osc.frequency.linearRampToValueAtTime(800, time + 0.15);

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.2);
}

// ===== Settings API =====

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
  return getSettings().enabled;
}

/**
 * Toggle sounds on/off
 */
export function toggleSound(): boolean {
  const settings = getSettings();
  settings.enabled = !settings.enabled;
  saveSettings(settings);
  return settings.enabled;
}

/**
 * Set sound enabled/disabled
 */
export function setSoundEnabled(enabled: boolean): void {
  const settings = getSettings();
  settings.enabled = enabled;
  saveSettings(settings);
}

/**
 * Get current volume (0-1)
 */
export function getVolume(): number {
  return getSettings().volume;
}

/**
 * Set volume (0-1)
 */
export function setVolume(volume: number): void {
  const settings = getSettings();
  settings.volume = Math.max(0, Math.min(1, volume));
  saveSettings(settings);
}

/**
 * Initialize audio context (call on first user interaction)
 * Required because browsers block autoplay until user interaction
 */
export function initAudio(): void {
  getAudioContext();
}
