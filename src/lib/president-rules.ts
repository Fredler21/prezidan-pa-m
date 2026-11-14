import type { PriorityId } from '../types';
import {
  COUNTRY, CREDIT_TRUST, DECISIONS_PER_YEAR, EVENTS, LEVELS, START, YEARS,
  type BadgeId, type DelayedEvent, type Effects, type GameDecision, type GameOption, type ProfileId, type Stats,
} from '../data/president-levels.ts';
import { DECISIONS } from '../data/president-decisions.ts';

/*
 * The rules of « Si m te prezidan » v4, with no DOM: the game state is only the decisions drawn for the
 * term and the answers given, and everything else (stats, flags, delayed events, stars, badges) is
 * replayed from them. That keeps a saved game small and makes every rule testable
 * (lib/president-rules.test.ts, `npm test`).
 */

export const TOTAL = YEARS * DECISIONS_PER_YEAR;

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export function applyEffects(s: Readonly<Stats>, e: Effects): Stats {
  const next = { ...s };
  for (const [k, v] of Object.entries(e) as [keyof Stats, number][]) next[k] = clamp(next[k] + v);
  return next;
}

/** Taxes at the start of years 2 to 5: the better the economy, the fuller the treasury. */
export function income(s: Readonly<Stats>): number {
  return 12 + Math.round(s.economy / 4);
}

/** The four country stats added up (the treasury is the budget, not a goal). */
export function countrySum(s: Readonly<Stats>): number {
  return COUNTRY.reduce((a, id) => a + s[id], 0);
}

/** The state of the country, 0 to 100: the average of the four country stats. */
export function scoreOf(s: Readonly<Stats>): number {
  return Math.round(countrySum(s) / COUNTRY.length);
}

export interface Payable { ok: boolean[]; credit: boolean[] }
/**
 * Which dossiers can be signed: those the treasury can pay for. When none can be paid for, the cheapest
 * may still be signed on credit (it costs public trust).
 */
export function payable(s: Readonly<Stats>, options: readonly GameOption[]): Payable {
  const afford = options.map((o) => o.cost <= s.treasury);
  if (afford.some(Boolean)) return { ok: afford, credit: afford.map(() => false) };
  const cheapest = Math.min(...options.map((o) => o.cost));
  const ok = options.map((o) => o.cost === cheapest);
  return { ok, credit: ok.slice() };
}

/** Signs a dossier: the cost leaves the treasury, the effects land, and a loan costs trust. */
export function applyChoice(s: Readonly<Stats>, option: GameOption, credit: boolean): Stats {
  let next: Stats = { ...s, treasury: clamp(s.treasury - option.cost) };
  next = applyEffects(next, option.e);
  if (credit) next = applyEffects(next, { trust: CREDIT_TRUST });
  return next;
}

/** Stars for a year, from the average change of the four country stats during it. */
export function starsFor(avgDelta: number): 1 | 2 | 3 {
  return avgDelta >= 6 ? 3 : avgDelta >= 2 ? 2 : 1;
}

/** The profile follows the strongest country stat (ties go to the first in order). */
export function profileOf(s: Readonly<Stats>): ProfileId {
  let best: ProfileId = 'security';
  for (const id of COUNTRY) if (s[id] > s[best]) best = id;
  return best;
}

/** 0: historic, 1: good, 2: average, 3: hard. */
export function gradeOf(score: number): 0 | 1 | 2 | 3 {
  return score >= 60 ? 0 : score >= 50 ? 1 : score >= 40 ? 2 : 3;
}

export interface YearStart { year: number; income: number; events: DelayedEvent[]; before: Stats; after: Stats }
/** Opens a year: taxes come in (not in year 1), then the delayed events whose flag was set. */
export function startYear(s: Readonly<Stats>, year: number, flags: ReadonlySet<string>): YearStart {
  const inc = year > 0 ? income(s) : 0;
  let after = applyEffects(s, { treasury: inc });
  const events = EVENTS.filter((e) => e.year === year && flags.has(e.flag));
  for (const ev of events) after = applyEffects(after, ev.e);
  return { year, income: inc, events, before: { ...s }, after };
}

const BY_ID = new Map(DECISIONS.map((d) => [d.id, d]));
export function decisionById(id: string): GameDecision | undefined { return BY_ID.get(id); }

/** A new term: one decision per slot of every level, never the same one twice in a level. */
export function drawRun(random: () => number = Math.random): string[] {
  const ids: string[] = [];
  for (const level of LEVELS) {
    const used = new Set<string>();
    for (const slot of level.slots) {
      const free = slot.filter((id) => !used.has(id));
      const id = free[Math.min(free.length - 1, Math.floor(random() * free.length))] ?? slot[0] ?? '';
      used.add(id);
      ids.push(id);
    }
  }
  return ids;
}

/** The decisions for a saved list of ids, or null when the list does not fit the levels (another version). */
export function decisionsOf(ids: readonly string[]): GameDecision[] | null {
  if (ids.length !== TOTAL) return null;
  const out: GameDecision[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const id = ids[i] ?? '';
    const slot = LEVELS[Math.floor(i / DECISIONS_PER_YEAR)]?.slots[i % DECISIONS_PER_YEAR];
    const d = BY_ID.get(id);
    if (!d || !slot?.includes(id)) return null;
    out.push(d);
  }
  return out;
}

export interface Step { year: number; index: number; decision: GameDecision; option: GameOption; choice: number; credit: boolean; before: Stats; after: Stats }
export interface YearLog { year: number; start: YearStart; steps: Step[]; end: Stats | null; delta: number | null; stars: 1 | 2 | 3 | null }
export interface Replay {
  /** The stats now (after the last answer, and after the opening of the current year). */
  stats: Stats;
  flags: Set<string>;
  years: YearLog[];
  steps: Step[];
  /** Valid answers replayed (answers after an invalid one are dropped). */
  n: number;
  /** Current year (0 to 4) and decision within it (0 to 2; 3 once the term is over). */
  year: number;
  d: number;
  done: boolean;
  stars: (1 | 2 | 3)[];
}

/** Replays a term from the start. */
export function replay(decisions: readonly GameDecision[], answers: readonly number[]): Replay {
  let st: Stats = { ...START };
  const flags = new Set<string>();
  const years: YearLog[] = [];
  const steps: Step[] = [];
  const stars: (1 | 2 | 3)[] = [];
  let n = 0;
  outer: for (let y = 0; y < YEARS; y++) {
    const start = startYear(st, y, flags);
    st = start.after;
    const log: YearLog = { year: y, start, steps: [], end: null, delta: null, stars: null };
    years.push(log);
    for (let d = 0; d < DECISIONS_PER_YEAR; d++) {
      const i = y * DECISIONS_PER_YEAR + d;
      const decision = decisions[i];
      const a = answers[i];
      if (!decision || a === undefined) break outer;
      const pay = payable(st, decision.o);
      const option = decision.o[a];
      if (!option || !pay.ok[a]) break outer;
      const credit = pay.credit[a] ?? false;
      const after = applyChoice(st, option, credit);
      if (option.flag) flags.add(option.flag);
      const step: Step = { year: y, index: i, decision, option, choice: a, credit, before: st, after };
      log.steps.push(step);
      steps.push(step);
      st = after;
      n++;
    }
    log.end = { ...st };
    log.delta = (countrySum(st) - countrySum(start.after)) / COUNTRY.length;
    log.stars = starsFor(log.delta);
    stars.push(log.stars);
  }
  const done = n === TOTAL;
  const year = Math.min(YEARS - 1, Math.floor(n / DECISIONS_PER_YEAR));
  return { stats: st, flags, years, steps, n, year, d: n - year * DECISIONS_PER_YEAR, done, stars };
}

/** Every badge a replayed term has earned (badges already owned are kept by the caller). */
export function badgesOf(r: Replay, streak: number): BadgeId[] {
  const out = new Set<BadgeId>();
  if (r.steps.length) out.add('first');
  const check = (s: Stats) => {
    if (s.security >= 55) out.add('road');
    if (s.economy >= 55) out.add('build');
    if (s.social >= 55) out.add('teach');
    if (s.trust >= 70) out.add('people');
  };
  for (const y of r.years) {
    check(y.start.after);
    for (const step of y.steps) check(step.after);
    if (y.end && y.stars !== null) {
      if (y.end.treasury >= 25) out.add('thrift');
      if (y.stars === 3) out.add('star3');
      if (y.year === 3 && y.stars >= 2) out.add('storm');
    }
  }
  if (r.flags.has('remit')) out.add('remit');
  if (r.done) out.add('full');
  if (streak >= 3) out.add('streak');
  return [...out];
}

/**
 * The three priorities the player's choices speak to most (main 2 points, second 1), ties going to the
 * one reached first, for the comparison with candidates' public record. Never a recommendation.
 */
export function topPriorities(steps: readonly Step[], n = 3): PriorityId[] {
  const score = new Map<PriorityId, number>();
  const first = new Map<PriorityId, number>();
  let k = 0;
  const add = (id: PriorityId | undefined, w: number) => {
    if (!id) return;
    score.set(id, (score.get(id) ?? 0) + w);
    if (!first.has(id)) first.set(id, k++);
  };
  for (const s of steps) { add(s.option.p, 2); add(s.option.p2, 1); }
  return [...score.keys()]
    .sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0) || (first.get(a) ?? 0) - (first.get(b) ?? 0))
    .slice(0, n);
}

/** Days in a row: the same day keeps it, the day after adds one, anything else starts again at 1. */
export function nextStreak(prev: { streak: number; day: string }, today: string, yesterday: string): { streak: number; day: string } {
  if (prev.day === today) return { streak: Math.max(1, prev.streak), day: today };
  if (prev.day === yesterday) return { streak: prev.streak + 1, day: today };
  return { streak: 1, day: today };
}
