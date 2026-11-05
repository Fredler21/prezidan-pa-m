import type { L10n } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, fmtNumber, l } from '../i18n';
import { content } from '../content';
import { FIRST_ROUND } from '../data/dates';
import { QUIZ, quizFromContent, type QuizQuestion } from '../data/quiz';
import { SITE_URL } from '../data/site';
import { copyText } from '../lib/util';
import { toast } from './toast';
import { footer } from './common';

/*
 * « Konnen Ayiti »: five questions a day, the same five for everyone on a given date, with a
 * fact after each answer, a streak, a result grid to share and a practice mode once the day is
 * done. Everything is kept on the device (localStorage); nothing is sent anywhere.
 */

const KEY = 'ppm.quiz.v1';
const PER_DAY = 5;
const DAY_ONE = Date.UTC(2026, 10, 4); // « Jou #1 »

interface Stats { played: number; streak: number; best: number; last: string | null; correct: number }
/** score: correct answers today, kept so the dashboard can show it without loading the question bank. */
interface Save { day: string; ids: string[]; answers: (number | null)[]; stats: Stats; score?: number }

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n: number) => String(n).padStart(2, '0');
function dayKey(d = new Date()): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function yesterdayKey(): string { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); }
function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.max(1, Math.round((Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1) - DAY_ONE) / 86400000) + 1);
}
/** Small seeded generator, so a date always gives the same questions. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(s: string): number { let x = 2166136261; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return x >>> 0; }
function shuffled<T>(arr: readonly T[], r: () => number): T[] { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j] as T, a[i] as T]; } return a; }

function pool(): QuizQuestion[] {
  const c = content();
  const now = (iso: string): L10n => { const t = fmtDate(iso); return { ht: t, fr: t, en: t }; };
  const others = c.dates.filter((d) => d.date !== FIRST_ROUND).map((d) => now(d.date));
  return [...QUIZ, ...quizFromContent({ firstRound: now(FIRST_ROUND), otherDates: others.slice(-3), candidates: c.candidates.length })];
}
function dailyIds(key: string, all: QuizQuestion[]): string[] { return shuffled(all.map((q) => q.id), rng(hash(`ppm:${key}`))).slice(0, PER_DAY); }

function load(all: QuizQuestion[]): Save {
  const today = dayKey();
  let s: Save | null = null;
  try { const raw = localStorage.getItem(KEY); if (raw) s = JSON.parse(raw) as Save; } catch { /* storage off */ }
  const stats: Stats = s?.stats ?? { played: 0, streak: 0, best: 0, last: null, correct: 0 };
  if (s && s.day === today && Array.isArray(s.ids) && s.ids.length === PER_DAY && s.ids.every((id) => all.some((q) => q.id === id))) return { ...s, stats };
  return { day: today, ids: dailyIds(today, all), answers: Array(PER_DAY).fill(null), stats };
}
function persist(s: Save): void { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off */ } }

/** Streak shown before today is finished: it is still alive if the last finished day was yesterday or today. */
function liveStreak(st: Stats): number { return st.last === dayKey() || st.last === yesterdayKey() ? st.streak : 0; }

function confetti(host: HTMLElement): void {
  if (reduced()) return;
  const layer = h('div', { class: 'qz-confetti', 'aria-hidden': 'true' });
  const colors = ['#1A3BB5', '#7D93E8', '#FFD66B', '#FFFFFF', '#3D63E6'];
  for (let i = 0; i < 40; i++) {
    const p = h('i');
    p.style.setProperty('--x', `${(Math.random() * 2 - 1) * 180}px`);
    p.style.setProperty('--y', `${-120 - Math.random() * 180}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    p.style.setProperty('--d', `${Math.random() * 0.25}s`);
    p.style.background = colors[i % colors.length] ?? '#fff';
    layer.append(p);
  }
  host.append(layer);
  window.setTimeout(() => layer.remove(), 2400);
}

/** The game: a question card and a score card. Same component on the home page, the game page and the poll page. */
export function quizGame(): { el: HTMLElement; streakPill: HTMLElement; destroy: () => void } {
  const s = S().quiz;
  const all = pool();
  const byId = new Map(all.map((q) => [q.id, q]));
  let save = load(all);
  let mode: 'daily' | 'practice' = 'daily';
  let practice: { q: QuizQuestion; picked: number | null } | null = null;
  let practiceScore = { ok: 0, n: 0 };
  let timer = 0;
  let alive = true;

  const card = h('div', { class: 'qz-card' });
  const side = h('aside', { class: 'qz-side' });
  const live = h('p', { class: 'sr', 'aria-live': 'polite' });
  const streakPill = h('span', { class: 'qz-streak' });
  const el = h('div', { class: 'qz-grid' }, card, side, live);

  const label = (o: string | L10n) => (typeof o === 'string' ? o : l(o));
  const dailyQ = (i: number) => byId.get(save.ids[i] ?? '') as QuizQuestion;
  const doneCount = () => save.answers.filter((a) => a !== null).length;
  const correctCount = () => save.answers.reduce<number>((n, a, i) => n + (a !== null && a === dailyQ(i).answer ? 1 : 0), 0);
  const finished = () => doneCount() === PER_DAY;
  const current = () => save.answers.findIndex((a) => a === null);

  /** One question with its four options; `picked` set means answered (shows right and wrong, then the fact). */
  function questionView(q: QuizQuestion, picked: number | null, onPick: (i: number) => void, next: HTMLElement | null): HTMLElement {
    const opts = h('div', { class: 'qz-opts', role: 'group', 'aria-label': l(q.q) });
    q.options.forEach((o, i) => {
      const answered = picked !== null;
      const isRight = i === q.answer, isPicked = i === picked;
      const cls = !answered ? 'qz-opt' : isRight ? 'qz-opt ok' : isPicked ? 'qz-opt bad' : 'qz-opt dim';
      const b = h('button', { class: cls, type: 'button', 'aria-disabled': answered ? 'true' : undefined, style: `--i:${i}` },
        h('span', { class: 'qz-letter', 'aria-hidden': 'true' }, 'ABCD'[i] ?? ''), h('span', { class: 'qz-label' }, label(o)),
        answered && isRight ? svg(ICON.check, 'ico qz-mark') : null, answered && isPicked && !isRight ? svg(ICON.close, 'ico qz-mark') : null);
      if (!answered) b.addEventListener('click', () => onPick(i));
      opts.append(b);
    });
    const body = h('div', { class: 'qz-body' }, h('h3', { class: 'qz-q' }, l(q.q)), opts);
    if (picked !== null) {
      const verdict = picked === q.answer ? s.correct : `${s.wrong} ${label(q.options[q.answer] ?? '')}.`;
      body.append(h('div', { class: 'qz-fact' }, svg(ICON.info), h('p', null, h('strong', null, verdict), ' ', l(q.fact))));
      if (next) body.append(next);
    }
    return body;
  }

  function progressBar(): HTMLElement {
    return h('div', { class: 'qz-prog', 'aria-hidden': 'true' }, ...save.answers.map((a, i) => {
      const cls = a === null ? (i === current() ? 'now' : '') : a === dailyQ(i).answer ? 'ok' : 'bad';
      return h('i', { class: cls });
    }));
  }

  function drawCard(): void {
    clear(card);
    if (mode === 'practice' && practice) {
      const p = practice;
      const next = h('button', { class: 'btn btn-primary btn-block qz-next', type: 'button', onclick: () => { newPractice(); drawCard(); focusCard(); } }, s.next, svg(ICON.arrowRight));
      card.append(
        h('div', { class: 'qz-top' }, h('span', null, s.practiceTitle), h('span', { class: 'num' }, fmt(s.practiceScore, { c: practiceScore.ok, n: practiceScore.n }))),
        questionView(p.q, p.picked, (i) => {
          p.picked = i; practiceScore.n++; if (i === p.q.answer) practiceScore.ok++;
          buzz(); announce(i === p.q.answer ? s.correct : `${s.wrong} ${label(p.q.options[p.q.answer] ?? '')}`);
          drawCard(); (card.querySelector('.qz-next') as HTMLElement | null)?.focus();
        }, next),
        h('button', { class: 'link-btn qz-back', type: 'button', onclick: () => { mode = 'daily'; practice = null; drawCard(); drawSide(); } }, svg(ICON.back), s.backToday));
      return;
    }
    const recapNow = finished() && viewing === null;
    const top = h('div', { class: 'qz-top' }, h('span', { class: 'num' }, fmt(s.day, { n: dayNumber(save.day) })),
      h('span', { class: 'num' }, recapNow ? s.doneToday : fmt(s.progress, { i: (viewing ?? current()) + 1, n: PER_DAY })));
    if (recapNow) {
      const recap = h('ol', { class: 'qz-recap' }, ...save.ids.map((id, i) => {
        const q = byId.get(id) as QuizQuestion; const ok = save.answers[i] === q.answer;
        return h('li', { class: ok ? 'ok' : 'bad' }, svg(ok ? ICON.check : ICON.close, 'ico'), h('span', null, h('b', null, l(q.q)), h('small', null, label(q.options[q.answer] ?? ''))));
      }));
      card.append(top, progressBar(), h('h3', { class: 'qz-q' }, s.recapTitle), recap,
        h('button', { class: 'btn btn-primary btn-block qz-next', type: 'button', onclick: startPractice }, svg(ICON.sliders), s.practice));
      return;
    }
    // The question being answered stays on screen with its fact until « Next ».
    const shown = viewing ?? current();
    const q = dailyQ(shown);
    const last = shown === PER_DAY - 1;
    const next = h('button', { class: 'btn btn-primary btn-block qz-next', type: 'button', onclick: () => {
      viewing = null; drawCard(); drawSide(); focusCard();
      if (finished() && correctCount() === PER_DAY) confetti(side);
    } }, last ? s.finish : s.next, svg(ICON.arrowRight));
    card.append(top, progressBar(), questionView(q, save.answers[shown] ?? null, (i) => answerDaily(shown, i), next));
  }
  let viewing: number | null = null;

  function answerDaily(index: number, choice: number): void {
    if (save.answers[index] !== null) return;
    save.answers[index] = choice;
    viewing = index;
    const q = dailyQ(index);
    if (finished()) {
      const st = save.stats;
      if (st.last !== save.day) {
        st.streak = st.last === yesterdayKey() ? st.streak + 1 : 1;
        st.best = Math.max(st.best, st.streak);
        st.played += 1;
        st.correct += correctCount();
        st.last = save.day;
      }
    }
    save.score = correctCount();
    persist(save);
    buzz();
    announce(choice === q.answer ? s.correct : `${s.wrong} ${label(q.options[q.answer] ?? '')}`);
    drawCard(); drawSide();
    (card.querySelector('.qz-next') as HTMLElement | null)?.focus();
  }

  function drawSide(): void {
    clear(side);
    window.clearInterval(timer);
    const st = save.stats;
    const done = finished();
    const ok = correctCount();
    const streak = done ? st.streak : liveStreak(st);
    streakPill.textContent = `🔥 ${fmt(s.streak, { n: streak })}`;
    streakPill.hidden = streak < 1;
    const squares = h('div', { class: 'qz-squares', 'aria-hidden': 'true' }, ...save.answers.map((a, i) => h('i', { class: a === null ? '' : a === dailyQ(i).answer ? 'ok' : 'bad' })));
    const msg = !done ? s.inProgress : ok === PER_DAY ? s.perfect : ok >= 3 ? s.good : s.ok;
    const stat = (n: number, t: string) => h('div', null, h('b', { class: 'num' }, fmtNumber(n)), h('span', null, t));
    side.append(
      h('div', { class: 'qz-side-head' }, h('span', { class: 'board-kicker' }, fmt(s.day, { n: dayNumber(save.day) })), h('span', { class: 'qz-badge' }, done ? s.badgeDone : s.badgeLive)),
      h('b', { class: 'qz-score num' }, `${ok}/${PER_DAY}`),
      h('p', { class: 'qz-msg' }, msg),
      squares,
      h('div', { class: 'qz-stats' }, stat(streak, s.streakLabel), stat(st.best, s.best), stat(st.played, s.played)));
    if (done) {
      const count = h('b', { class: 'num' });
      const tick = () => {
        const now = new Date(); const next = new Date(now); next.setHours(24, 0, 0, 0);
        const left = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
        count.textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
        if (left === 0 && alive) { save = load(all); viewing = null; drawCard(); drawSide(); }
      };
      tick();
      timer = window.setInterval(tick, 1000);
      side.append(
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => void share() }, svg(ICON.share), s.share),
        h('button', { class: 'btn btn-block qz-ghost', type: 'button', onclick: startPractice }, s.practice),
        h('p', { class: 'qz-count' }, svg(ICON.calendar), fmt(s.nextSet, { t: '' }), count));
    } else {
      side.append(h('p', { class: 'qz-hint' }, s.howTo));
    }
  }

  async function share(): Promise<void> {
    const grid = save.answers.map((a, i) => (a === dailyQ(i).answer ? '🟦' : '⬜')).join('');
    const text = fmt(s.shareText, { d: dayNumber(save.day), s: correctCount(), grid, k: save.stats.streak, url: `${SITE_URL}/#quiz` });
    try { if (typeof navigator.share === 'function') { await navigator.share({ text }); return; } }
    catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return; }
    toast((await copyText(text)) ? s.copied : text, 4000);
  }

  function newPractice(): void {
    const recent = practice ? [practice.q.id] : [];
    const choices = all.filter((q) => !recent.includes(q.id));
    practice = { q: choices[Math.floor(Math.random() * choices.length)] ?? all[0] as QuizQuestion, picked: null };
  }
  function startPractice(): void { mode = 'practice'; practiceScore = { ok: 0, n: 0 }; newPractice(); drawCard(); focusCard(); }
  function focusCard(): void { (card.querySelector('.qz-opt:not([aria-disabled])') as HTMLElement | null)?.focus({ preventScroll: true }); }
  function announce(t: string): void { live.textContent = t; }
  function buzz(): void { try { navigator.vibrate?.(12); } catch { /* not supported */ } }

  // A finished day re-opens on its recap; a half-played day resumes where it stopped.
  drawCard(); drawSide();
  return { el, streakPill, destroy: () => { alive = false; window.clearInterval(timer); } };
}

/** The game page (#quiz). */
export function renderQuiz(main: HTMLElement): () => void {
  clear(main);
  const s = S().quiz;
  const game = quizGame();
  main.append(h('div', { class: 'wrap page qz-page' },
    h('div', { class: 'qz-head' },
      h('div', null, h('p', { class: 'kicker' }, s.kicker), h('h1', { class: 'page-title' }, s.title), h('p', { class: 'lead' }, s.lead)),
      game.streakPill),
    game.el,
    h('p', { class: 'caption qz-source' }, s.sourceNote),
    footer()));
  return game.destroy;
}
