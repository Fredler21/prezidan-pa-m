/*
 * Small Web Audio tones and vibrations for « Si m te prezidan ». Nothing plays before the visitor has
 * touched the game (browsers require a gesture, and silence is the polite default), and the mute
 * switch silences both sound and vibration. The choice is remembered on this device ('ppm.sound').
 */

const KEY = 'ppm.sound';
let muted = (() => { try { return localStorage.getItem(KEY) === 'off'; } catch { return false; } })();
let unlocked = false;
let ac: AudioContext | null = null;

type Ctor = typeof AudioContext;
const AudioCtor = (): Ctor | undefined => window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;

/** Called on the visitor's first tap or key press inside the game. */
export function unlockSound(): void { unlocked = true; }
export function isMuted(): boolean { return muted; }
export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch { /* storage off */ }
  if (m && ac && ac.state === 'running') void ac.suspend().catch(() => undefined);
}

function tone(freq: number, dur: number, type: OscillatorType = 'triangle', vol = 0.1, when = 0): void {
  if (muted || !unlocked) return;
  try {
    const C = AudioCtor();
    if (!C) return;
    ac ??= new C();
    if (ac.state === 'suspended') void ac.resume().catch(() => undefined);
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime + when;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* audio unavailable: the game stays silent */ }
}

export const sfx = {
  tap: () => tone(540, 0.06),
  stamp: () => { tone(95, 0.22, 'square', 0.16); tone(55, 0.32, 'sine', 0.3); },
  up: () => [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.11, i * 0.09)),
  down: () => [330, 262, 196].forEach((f, i) => tone(f, 0.2, 'sawtooth', 0.05, i * 0.11)),
  star: (i: number) => tone(700 + i * 180, 0.25, 'triangle', 0.13),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.11)),
  badge: () => { tone(988, 0.1, 'sine', 0.12); tone(1319, 0.25, 'sine', 0.12, 0.1); },
};

export function vibrate(pattern: number | number[]): void {
  if (muted || !unlocked) return;
  try { if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern); } catch { /* not supported */ }
}

/** Stops audio when the game page is left. */
export function closeSound(): void {
  if (ac) { void ac.close().catch(() => undefined); ac = null; }
}
