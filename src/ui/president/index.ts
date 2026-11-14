import { h, svg, clear } from '../../lib/dom';
import { ICON } from '../../lib/icons';
import { S, fmt, l } from '../../i18n';
import { BADGES, type BadgeId } from '../../data/president-levels.ts';
import { badgesOf, decisionsOf, drawRun, nextStreak, profileOf, replay, scoreOf, topPriorities } from '../../lib/president-rules.ts';
import {
  bestScore, dayKey, dropLegacyGame, gameMeta, gameResult, gameRun, saveBestScore, saveGameMeta, saveGameResult, saveGameRun,
  type GameMeta, type GameResult,
} from '../../lib/progress';
import { confetti } from '../../lib/confetti';
import { getAccount, onAccountChange, onGameSynced, saveGameProgress } from '../../account';
import { footer } from '../common';
import { whyVote } from '../why-vote';
import { toast } from '../toast';
import { GI } from './art';
import { reduced, type Ctx, type ScreenId, type ShowOptions, type Term } from './parts';
import { closeSound, isMuted, setMuted, sfx, unlockSound } from './sound';
import { closeGameSheet, openBadges, openTutorial } from './sheets';
import { homeScreen } from './screens/home';
import { mapScreen } from './screens/level-map';
import { introScreen } from './screens/intro';
import { decisionScreen } from './screens/decision';
import { resultScreen } from './screens/result';
import { reportScreen } from './screens/report';
import { finalScreen } from './screens/final';

/*
 * « Si m te prezidan » v4 (Stitch project « Si m te prezidan · jwèt nivo (v4) », docs/design/v4): a five year
 * term as five levels on the living map of Haiti. This module holds the state and moves between the screens
 * (screens/*); the rules are in lib/president-rules.ts and the data in data/president-*.ts.
 *
 * Saving is for signed-in players only (their choice): the term, the last result, the best score, the
 * badges and the streak live on the device and in users/{uid}.game4. Guests keep their game in memory while
 * the tab is open; signing in mid-term hands it to the account.
 */

const TUTORIAL_KEY = 'ppm.pres4.tut';
const BUILD: Record<ScreenId, (c: Ctx, o: ShowOptions) => HTMLElement> = {
  home: homeScreen, map: mapScreen, intro: introScreen, decision: decisionScreen, result: resultScreen, report: reportScreen, final: finalScreen,
};

/** A guest's game, kept for this tab only (never written to storage). */
let guest: { ids: string[]; answers: number[]; meta: GameMeta; best: number | null; last: GameResult | null } | null = null;

function loadTerm(ids: readonly string[], answers: readonly number[]): Term | null {
  const decisions = decisionsOf(ids);
  if (!decisions) return null;
  const r = replay(decisions, answers);
  return { ids: [...ids], decisions, answers: answers.slice(0, r.n), r };
}
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };

export function renderPresident(main: HTMLElement): () => void {
  clear(main);
  dropLegacyGame();
  const s = S().pres;
  let alive = true;
  let current: ScreenId = 'home';
  let screenTimers: number[] = [];
  let screenStops: (() => void)[] = [];
  const pageTimers: number[] = [];

  const signedIn = () => getAccount() !== null;
  const c: Ctx = {
    term: null, meta: { badges: [], streak: 0, day: '' }, best: null, last: null, record: false, fresh: [],
    signedIn,
    go: (screen, o) => show(screen, o),
    newTerm,
    answer,
    later: (fn, ms) => { screenTimers.push(window.setTimeout(() => { if (alive) fn(); }, ms)); },
    track: (stop) => { screenStops.push(stop); },
    shake: (el) => {
      if (reduced()) return;
      el.classList.remove('gm-shake'); void el.offsetWidth; el.classList.add('gm-shake');
      window.setTimeout(() => el.classList.remove('gm-shake'), 500);
    },
    celebrate: () => confetti(stage),
    openBadges: () => openBadges(c),
    maybeTutorial: () => {
      try { if (localStorage.getItem(TUTORIAL_KEY)) return; localStorage.setItem(TUTORIAL_KEY, '1'); } catch { return; }
      openTutorial();
    },
  };

  // ---- state: the account's game on this device, or the guest's game in memory ----
  const loadState = () => {
    if (signedIn()) {
      const run = gameRun();
      c.last = gameResult();
      c.term = run ? loadTerm(run.ids, run.answers) : c.last ? loadTerm(c.last.ids, c.last.answers) : null;
      c.meta = gameMeta();
      c.best = bestScore();
    } else {
      c.term = guest ? loadTerm(guest.ids, guest.answers) : null;
      c.meta = guest?.meta ?? { badges: [], streak: 0, day: '' };
      c.best = guest?.best ?? null;
      c.last = guest?.last ?? null;
    }
  };
  const persist = () => {
    const t = c.term;
    if (signedIn()) {
      if (t && !t.r.done) saveGameRun({ v: 4, ids: t.ids, answers: t.answers }); else saveGameRun(null);
      saveGameMeta(c.meta);
      saveGameProgress();
    } else {
      guest = { ids: t?.ids ?? [], answers: t?.answers ?? [], meta: c.meta, best: c.best, last: c.last };
    }
  };
  loadState();

  // The days-in-a-row streak counts the days the game is opened.
  const ns = nextStreak({ streak: c.meta.streak, day: c.meta.day }, dayKey(), yesterday());
  if (ns.day !== c.meta.day || ns.streak !== c.meta.streak) { c.meta = { ...c.meta, ...ns }; persist(); }

  // ---- the page: game bar, the stage, the disclaimer (always visible), why voting matters, footer ----
  const bar = h('div', { class: 'gm-gamebar' });
  const stage = h('div', { class: 'gm-stage' });
  const page = h('div', { class: 'wrap gm-page' },
    bar, stage,
    h('p', { class: 'gm-note' }, svg(ICON.info), s.gameNote),
    whyVote(), footer());
  main.append(page);
  const unlock = () => unlockSound();
  page.addEventListener('pointerdown', unlock, { capture: true });
  page.addEventListener('keydown', unlock, { capture: true });

  const drawBar = () => {
    const muted = isMuted();
    const sound = h('button', { class: 'gm-icon', type: 'button', 'aria-label': muted ? s.soundOn : s.soundOff, title: muted ? s.soundOn : s.soundOff },
      svg(muted ? GI.mute : GI.sound));
    sound.addEventListener('click', () => { setMuted(!isMuted()); drawBar(); if (!isMuted()) sfx.tap(); (bar.querySelector('.gm-icon:last-child') as HTMLElement | null)?.focus(); });
    const streak = signedIn() && c.meta.streak > 0
      ? h('span', { class: 'gm-chip gold', title: fmt(s.streakLong, { n: c.meta.streak }) },
        svg(GI.flame), h('span', { 'aria-hidden': 'true' }, fmt(s.streak, { n: c.meta.streak })), h('span', { class: 'sr' }, fmt(s.streakLong, { n: c.meta.streak })))
      : '';
    bar.replaceChildren(
      h('span', { class: 'gm-flag', 'aria-hidden': 'true' }),
      h('b', { class: 'gm-brand' }, s.title),
      h('span', { class: 'grow' }),
      streak,
      h('button', { class: 'gm-icon', type: 'button', 'aria-label': s.badges, title: s.badges, onclick: () => { sfx.tap(); c.openBadges(); } }, svg(GI.medal)),
      sound);
  };

  // ---- screens ----
  function show(screen: ScreenId, o: ShowOptions = {}): void {
    if (!alive) return;
    for (const t of screenTimers) clearTimeout(t);
    for (const f of screenStops) f();
    screenTimers = []; screenStops = [];
    const r = c.term?.r;
    // Screens that need a term fall back to a sensible one.
    if (screen !== 'home' && !r) screen = 'home';
    else if (r?.done && (screen === 'map' || screen === 'intro' || screen === 'decision')) screen = 'final';
    else if (r && !r.done && screen === 'final') screen = 'map';
    current = screen;
    const el = BUILD[screen](c, o);
    el.classList.add('gm-screen');
    stage.replaceChildren(el);
    window.scrollTo({ top: 0 });
    (el.querySelector('[data-focus]') as HTMLElement | null)?.focus({ preventScroll: true });
  }

  function newTerm(): void {
    c.term = loadTerm(drawRun(), []);
    c.record = false;
    c.fresh = [];
    persist();
    show('map');
  }

  // Badges are earned once and kept; new ones are announced one by one.
  const award = (ids: BadgeId[]) => {
    const fresh = ids.filter((id) => !c.meta.badges.includes(id));
    if (!fresh.length) return;
    c.meta = { ...c.meta, badges: [...c.meta.badges, ...fresh] };
    c.fresh.push(...fresh);
    fresh.forEach((id, i) => {
      pageTimers.push(window.setTimeout(() => {
        if (!alive) return;
        toast(fmt(s.badgeToast, { b: l(BADGES.find((b) => b.id === id)?.name) }), 3000);
        sfx.badge();
      }, 900 + i * 1600));
    });
    drawBar();
  };

  function answer(choice: number): void {
    const t = c.term;
    if (!t || t.r.done) return;
    const answers = [...t.answers, choice];
    const r = replay(t.decisions, answers);
    if (r.n !== answers.length) return;
    c.term = { ...t, answers, r };
    award(badgesOf(r, c.meta.streak));
    if (r.done) {
      const score = scoreOf(r.stats);
      const result: GameResult = { v: 4, ids: t.ids, answers, score, stars: r.stars.reduce<number>((a, b) => a + b, 0), profile: profileOf(r.stats), top: topPriorities(r.steps), at: Date.now() };
      c.last = result;
      if (signedIn()) { saveGameResult(result); c.record = saveBestScore(score); c.best = bestScore(); }
      else { c.record = c.best === null || score > c.best; c.best = Math.max(c.best ?? 0, score); }
    }
    persist();
    show('result');
  }

  // ---- accounts: signing in hands the game to the account; signing out leaves it in memory ----
  const offAccount = onAccountChange((a) => {
    if (!alive) return;
    if (a) {
      const t = c.term;
      if (t && !t.r.done) saveGameRun({ v: 4, ids: t.ids, answers: t.answers });
      if (c.last) saveGameResult(c.last);
      if (c.best !== null) saveBestScore(c.best);
      const m = gameMeta();
      saveGameMeta({ badges: [...new Set([...m.badges, ...c.meta.badges])], streak: Math.max(m.streak, c.meta.streak), day: m.day > c.meta.day ? m.day : c.meta.day });
      guest = null;
    } else {
      const t = c.term;
      guest = { ids: t?.ids ?? [], answers: t?.answers ?? [], meta: c.meta, best: c.best, last: c.last };
    }
    drawBar();
    if (current === 'home') show('home');
  });
  const offSync = onGameSynced(() => {
    if (!alive) return;
    const before = c.term ? `${c.term.ids.join()}|${c.term.answers.join()}` : '';
    loadState();
    const after = c.term ? `${c.term.ids.join()}|${c.term.answers.join()}` : '';
    drawBar();
    if (before !== after && (current === 'home' || current === 'map')) show(current);
  });

  drawBar();
  if (c.meta.streak >= 3 && !c.meta.badges.includes('streak')) { award(['streak']); persist(); }
  show('home');

  return () => {
    alive = false;
    for (const t of screenTimers) clearTimeout(t);
    for (const t of pageTimers) clearTimeout(t);
    for (const f of screenStops) f();
    offAccount(); offSync();
    closeGameSheet();
    closeSound();
  };
}
