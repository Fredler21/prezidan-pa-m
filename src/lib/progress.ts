import type { PriorityId } from '../types';

/*
 * What the visitor has done so far, read from this device only (localStorage). The dashboard
 * uses these summaries so it never has to load the games or their question banks.
 */

const QUIZ_KEY = 'ppm.quiz.v1';
const GAME_KEY = 'ppm.president.v1';
const SEEN_KEY = 'ppm.seen.candidates';
const QUIZ_DAY_ONE = Date.UTC(2026, 10, 4);

function read(key: string): unknown {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as unknown) : null; } catch { return null; }
}
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const pad = (n: number) => String(n).padStart(2, '0');
export function dayKey(d = new Date()): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export interface QuizStatus { day: number; answered: number; total: number; score: number | null; done: boolean; streak: number }

/** Today's « Konnen Ayiti » progress and the live streak (same rules as the game). */
export function quizStatus(): QuizStatus {
  const today = dayKey();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); })();
  const [y, m, d] = today.split('-').map(Number);
  const day = Math.max(1, Math.round((Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1) - QUIZ_DAY_ONE) / 86400000) + 1);
  const s = read(QUIZ_KEY);
  const total = 5;
  if (!isRecord(s)) return { day, answered: 0, total, score: null, done: false, streak: 0 };
  const stats = isRecord(s.stats) ? s.stats : {};
  const last = typeof stats.last === 'string' ? stats.last : null;
  const streak = (last === today || last === yesterday) && typeof stats.streak === 'number' ? stats.streak : 0;
  if (s.day !== today || !Array.isArray(s.answers)) return { day, answered: 0, total, score: null, done: false, streak };
  const answered = s.answers.filter((a) => a !== null).length;
  return { day, answered, total, score: typeof s.score === 'number' ? s.score : null, done: answered >= total, streak };
}

export interface GameResult { answers: (number | null)[]; top: PriorityId[]; at: number }

export function gameResult(): GameResult | null {
  const s = read(GAME_KEY);
  if (!isRecord(s) || !Array.isArray(s.top) || !Array.isArray(s.answers)) return null;
  return { answers: s.answers as (number | null)[], top: (s.top as PriorityId[]).slice(0, 3), at: typeof s.at === 'number' ? s.at : 0 };
}
export function saveGameResult(r: GameResult): void {
  try { localStorage.setItem(GAME_KEY, JSON.stringify(r)); } catch { /* storage off: the result stays for this visit */ }
}

export function seenCandidates(): boolean { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } }
export function markSeenCandidates(): void { try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }

/** The civic card counts as made once it carries a name or a photo. */
export function cardMade(): boolean {
  try { return !!(localStorage.getItem('ppm.card.name')?.trim() || localStorage.getItem('ppm.card.photo')); } catch { return false; }
}
