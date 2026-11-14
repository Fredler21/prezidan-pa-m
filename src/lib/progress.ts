import type { PriorityId } from '../types';
import type { ProfileId } from '../data/president-levels.ts';

/*
 * What the visitor has done so far, read from this device (localStorage). The dashboard
 * uses these summaries so it never has to load the games or their question banks.
 */

const QUIZ_KEY = 'ppm.quiz.v1';
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

// ---- « Si m te prezidan » v4: kept on the device for signed-in players only (and synced to the account) ----
const RUN4 = 'ppm.pres4.run';
const LAST4 = 'ppm.pres4.last';
const BEST4 = 'ppm.pres4.best';
const META4 = 'ppm.pres4.meta';
const LEGACY = ['ppm.president.run', 'ppm.president.v2', 'ppm.president.best'];
const isNums = (v: unknown): v is number[] => Array.isArray(v) && v.every((x) => typeof x === 'number');
const isStrs = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const write = (key: string, v: unknown) => { try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage off */ } };

/** An unfinished term: the decisions drawn (15 ids) and the answers given so far. */
export interface GameRun { v: 4; ids: string[]; answers: number[] }
/** The last finished term. score: the state of the country, 0 to 100; stars: out of 15. */
export interface GameResult { v: 4; ids: string[]; answers: number[]; score: number; stars: number; profile: ProfileId; top: PriorityId[]; at: number }
/** Badges earned, and the days-in-a-row streak. */
export interface GameMeta { badges: string[]; streak: number; day: string }

export function asGameRun(v: unknown): GameRun | null {
  return isRecord(v) && v.v === 4 && isStrs(v.ids) && isNums(v.answers) ? { v: 4, ids: v.ids, answers: v.answers } : null;
}
export function asGameResult(v: unknown): GameResult | null {
  if (!isRecord(v) || v.v !== 4 || !isStrs(v.ids) || !isNums(v.answers) || typeof v.score !== 'number' || typeof v.profile !== 'string') return null;
  return { v: 4, ids: v.ids, answers: v.answers, score: v.score, stars: typeof v.stars === 'number' ? v.stars : 0, profile: v.profile as ProfileId,
    top: isStrs(v.top) ? (v.top as PriorityId[]).slice(0, 3) : [], at: typeof v.at === 'number' ? v.at : 0 };
}
export function asGameMeta(v: unknown): GameMeta | null {
  return isRecord(v) && isStrs(v.badges) ? { badges: v.badges, streak: typeof v.streak === 'number' ? v.streak : 0, day: typeof v.day === 'string' ? v.day : '' } : null;
}

export function gameRun(): GameRun | null { return asGameRun(read(RUN4)); }
export function saveGameRun(r: GameRun | null): void { write(RUN4, r); }
export function gameResult(): GameResult | null { return asGameResult(read(LAST4)); }
export function saveGameResult(r: GameResult): void { write(LAST4, r); }
export function gameMeta(): GameMeta { return asGameMeta(read(META4)) ?? { badges: [], streak: 0, day: '' }; }
export function saveGameMeta(m: GameMeta): void { write(META4, m); }

/** Best score so far; saving a better one returns true (a new record). */
export function bestScore(): number | null {
  try { const v = Number(localStorage.getItem(BEST4)); return Number.isFinite(v) && v > 0 ? v : null; } catch { return null; }
}
export function saveBestScore(score: number): boolean {
  const best = bestScore();
  if (best !== null && score <= best) return false;
  try { localStorage.setItem(BEST4, String(score)); } catch { /* storage off */ }
  return true;
}

/** Signing out: the game belongs to the account, not to this device. Also drops the old game's keys. */
export function clearGame(): void {
  for (const k of [RUN4, LAST4, BEST4, META4, ...LEGACY]) { try { localStorage.removeItem(k); } catch { /* storage off */ } }
}
/** The previous version of the game kept its data under other keys; nothing reads them any more. */
export function dropLegacyGame(): void {
  for (const k of LEGACY) { try { localStorage.removeItem(k); } catch { /* storage off */ } }
}

export function seenCandidates(): boolean { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } }
export function markSeenCandidates(): void { try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }

/** The civic card counts as made once it carries a name or a photo. */
export function cardMade(): boolean {
  try { return !!(localStorage.getItem('ppm.card.name')?.trim() || localStorage.getItem('ppm.card.photo')); } catch { return false; }
}
