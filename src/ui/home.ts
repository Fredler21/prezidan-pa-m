import type { Candidate, L10n, StorageAdapter } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, fmtNumber, l, timeAgo } from '../i18n';
import { content, candidatesShuffled } from '../content';
import { firebaseConfig } from '../firebase-config';
import { countDocuments, countWhere, findActive, getDocumentQuiet, recentDocs, type RestConfig } from '../content/firestore-rest';
import { STORAGE_MODE, getStorage } from '../storage';
import { FIRST_ROUND } from '../data/dates';
import { IMG } from '../data/images';
import { pct, daysUntil } from '../lib/util';
import { state } from '../state';
import { note, footer, well, avatar } from './common';
import { openProfile } from './profile';
import { toast } from './toast';
import { openAccountSheet } from './account';
import { getAccount } from '../account';
import { whyVote } from './why-vote';
import { quizStatus } from '../lib/progress';

const REST: RestConfig = { projectId: firebaseConfig.projectId, apiKey: firebaseConfig.apiKey, timeoutMs: 6000 };
const TOP = 5;
const TOP_CACHE = 'ppm.top.v1';
const REFRESH_MS = 60_000;
const FEED_SIZE = 5;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isL10n = (v: unknown): v is L10n => isRecord(v) && typeof v.ht === 'string';

interface HomeStats { votes: number | null; pollAnswers: number | null }
export interface Counts { counts: Record<string, number>; total: number; at: number }
interface PollOpt { id: string; label: L10n }
interface PollInfo { id: string; question: L10n; options: PollOpt[]; counts: Record<string, number>; total: number }
interface FeedItem { department: string; at: number }

/** Live numbers without the Firebase SDK: REST count() queries in Firebase mode, the local adapter in demo mode. */
async function loadStats(): Promise<HomeStats> {
  if (STORAGE_MODE === 'local') {
    const st = await getStorage();
    const poll = await st.getActivePoll();
    const votes = await new Promise<number>((resolve) => { const off = st.subscribeVotes((r) => { off(); resolve(r.total); }); });
    let answers = 0;
    if (poll) answers = await new Promise<number>((resolve) => { const off = st.subscribePollResults(poll.id, (r) => { off(); resolve(r.total); }); });
    return { votes, pollAnswers: answers };
  }
  const [votes, poll] = await Promise.all([countDocuments(REST, 'votes'), findActive(REST, 'polls', 'active', 'startsAt')]);
  let answers: number | null = 0; // no active poll means no answers
  if (poll.ok && poll.value) {
    const c = await countDocuments(REST, 'pollVotes', { field: 'pollId', equals: poll.value.id });
    answers = c.ok ? c.value : null;
  }
  return { votes: votes.ok ? votes.value : null, pollAnswers: answers };
}

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

/**
 * Votes per candidate for the Top 5 and the board, still without the SDK. A stats/presidential
 * document (maintained by Functions when they run) costs one read; otherwise one count() per candidate.
 */
export async function loadCounts(ids: readonly string[]): Promise<Counts | null> {
  if (STORAGE_MODE === 'local') {
    const st = await getStorage();
    return new Promise((resolve) => { const off = st.subscribeVotes((r) => { off(); resolve({ counts: r.counts, total: r.total, at: Date.now() }); }); });
  }
  const stats = await getDocumentQuiet(REST, 'stats/presidential');
  if (stats.ok && stats.value && isRecord(stats.value.counts)) {
    const raw = stats.value.counts;
    const counts: Record<string, number> = {};
    for (const id of ids) { const n = raw[id]; counts[id] = typeof n === 'number' ? n : 0; }
    const total = stats.value.total;
    return { counts, total: typeof total === 'number' ? total : sum(counts), at: Date.now() };
  }
  const rs = await Promise.all(ids.map((id) => countDocuments(REST, 'votes', { field: 'candidate', equals: id })));
  if (rs.every((r) => !r.ok)) return null;
  const counts: Record<string, number> = {};
  ids.forEach((id, i) => { const r = rs[i]; counts[id] = r && r.ok ? r.value : 0; });
  return { counts, total: sum(counts), at: Date.now() };
}

/** The active weekly poll with per-option counts (one count() per option). */
async function loadPoll(): Promise<PollInfo | null> {
  if (STORAGE_MODE === 'local') {
    const st = await getStorage();
    const p = await st.getActivePoll();
    if (!p) return null;
    const r = await new Promise<{ total: number; counts: Record<string, number> }>((resolve) => { const off = st.subscribePollResults(p.id, (x) => { off(); resolve(x); }); });
    return { id: p.id, question: p.question, options: p.options, counts: r.counts, total: r.total };
  }
  const r = await findActive(REST, 'polls', 'active', 'startsAt');
  if (!r.ok || !r.value) return null;
  const pollId = r.value.id;
  const d = r.value.data;
  if (!isL10n(d.question) || !Array.isArray(d.options)) return null;
  const options: PollOpt[] = [];
  for (const o of d.options) if (isRecord(o) && typeof o.id === 'string' && isL10n(o.label)) options.push({ id: o.id, label: o.label });
  const cs = await Promise.all(options.map((o) => countWhere(REST, 'pollVotes', [{ field: 'pollId', equals: pollId }, { field: 'option', equals: o.id }])));
  const counts: Record<string, number> = {};
  options.forEach((o, i) => { const c = cs[i]; counts[o.id] = c && c.ok ? c.value : 0; });
  return { id: pollId, question: d.question, options, counts, total: sum(counts) };
}

/** The newest votes, by department only (no names, no identifiers). */
async function loadFeed(): Promise<FeedItem[]> {
  if (STORAGE_MODE === 'local') {
    const st = await getStorage();
    return new Promise((resolve) => { const off = st.subscribeVotes((r) => { off(); resolve(r.reasons.slice(0, FEED_SIZE).map((x) => ({ department: x.department, at: x.at }))); }); });
  }
  const r = await recentDocs(REST, 'votes', 'updatedAt', FEED_SIZE, ['department', 'updatedAt']);
  if (!r.ok) return [];
  return r.value.map((x) => ({ department: typeof x.data.department === 'string' ? x.data.department : 'na', at: typeof x.data.updatedAt === 'string' ? Date.parse(x.data.updatedAt) : Date.now() }));
}

export function readTopCache(): Counts | null {
  try {
    const raw = localStorage.getItem(TOP_CACHE);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (!isRecord(v) || typeof v.at !== 'number' || typeof v.total !== 'number' || !isRecord(v.counts)) return null;
    const counts: Record<string, number> = {};
    for (const [k, n] of Object.entries(v.counts)) if (typeof n === 'number') counts[k] = n;
    return { counts, total: v.total, at: v.at };
  } catch { return null; }
}
export function writeTopCache(c: Counts): void {
  try { localStorage.setItem(TOP_CACHE, JSON.stringify(c)); } catch { /* storage disabled or full */ }
}
const pollKey = (id: string) => `ppm.poll.${id}`;
function readMyAnswer(id: string): string | null { try { return localStorage.getItem(pollKey(id)); } catch { return null; } }
function writeMyAnswer(id: string, option: string): void { try { localStorage.setItem(pollKey(id), option); } catch { /* ignore */ } }

/** Counts a number up (or down) in place; instant when the visitor prefers reduced motion. */
export function tween(el: HTMLElement, from: number, to: number, ms: number, format: (n: number) => string): () => void {
  if (reducedMotion() || from === to) { el.textContent = format(to); return () => {}; }
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
const asPct = (n: number) => `${n} %`;

interface TopRow { el: HTMLElement; pctEl: HTMLElement; barEl: HTMLElement; bar: HTMLElement; value: number; stop: () => void }

/** Same card as the results page (avatar, name, party, percentage, bar); opens the profile. */
function topRow(c: Candidate, i: number): TopRow {
  const pctEl = h('span', { class: 'pct num' }, '0 %');
  const barEl = h('i');
  const bar = h('div', { class: 'bar thick', role: 'img' }, barEl);
  const el = h('button', { class: 'cand top-row', type: 'button', style: `--i:${i}`, 'aria-haspopup': 'dialog', onclick: () => openProfile(c) },
    h('div', { class: 'cand-row' }, avatar(c), h('div', { class: 'cand-name' }, h('strong', null, c.name), h('span', { class: 'party' }, c.party)), pctEl),
    bar);
  return { el, pctEl, barEl, bar, value: 0, stop: () => {} };
}

function skeletonRow(i: number): HTMLElement {
  return h('div', { class: 'cand skel', style: `--i:${i}`, 'aria-hidden': 'true' },
    h('div', { class: 'cand-row' }, h('span', { class: 'sk-av' }), h('span', { class: 'cand-name' }, h('span', { class: 'sk-line w60' }), h('span', { class: 'sk-line w30' })), h('span', { class: 'sk-pct' })),
    h('div', { class: 'bar thick' }));
}
const skeletonLines = (n: number) => h('div', { class: 'board-skel', 'aria-hidden': 'true' }, ...Array.from({ length: n }, () => h('span', { class: 'sk-line' })));

/** Reveals sections as they scroll into view (no-op without IntersectionObserver or with reduced motion). */
function revealOnScroll(els: HTMLElement[]): () => void {
  if (!('IntersectionObserver' in window) || reducedMotion()) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of els) { el.classList.add('fx'); io.observe(el); }
  return () => io.disconnect();
}

/*
 * « Akèy », the public landing page (Stitch « s15-landing », phone and desktop): the same page for everyone,
 * signed in or not, and deliberately unlike the dashboard. Editorial hero (headline, two actions, three
 * promises, a mosaic of candidate portraits with the live count and the countdown), a numbers strip, the
 * people's vote (Top 5, the weekly poll answerable in place, the newest votes), the two games, the
 * candidates in random order, why the real vote matters, the citizen card invitation, who we are with the
 * next dates, one dark call to action, the footer. White everywhere by day; one dark band.
 */
export function renderHome(main: HTMLElement): () => void {
  clear(main);
  const s = S().home;
  const b = S().board;
  const im = S().images;
  const lp = S().landing;
  const c = content();
  const n = c.candidates.length;
  let alive = true;
  const cleanups: (() => void)[] = [];
  const signed = getAccount() !== null;

  const firstRound = c.dates.find((d) => d.date === FIRST_ROUND)?.date ?? FIRST_ROUND;
  const days = daysUntil(firstRound);
  const deptLabel = (id: string) => { const d = c.departments.find((x) => x.id === id); return d && d.id !== 'na' ? l(d.label) : b.someone; };
  const order = candidatesShuffled();

  // Live numbers appear in two places (the hero card and the numbers strip): every slot is kept here.
  const votesEls: HTMLElement[] = [];
  const answersEls: HTMLElement[] = [];
  const votesNum = () => { const e = h('b', { class: 'num' }, '·'); votesEls.push(e); return e; };
  const answersNum = () => { const e = h('b', { class: 'num' }, '·'); answersEls.push(e); return e; };
  let votesShown = 0;
  let stopVotes: (() => void)[] = [];
  const showVotes = (v: number) => { for (const f of stopVotes) f(); stopVotes = votesEls.map((e) => tween(e, votesShown, v, 1100, fmtNumber)); votesShown = v; };
  const kicker = (t: string) => h('p', { class: 'lp-kicker' }, t);
  const more = (href: string, label: string) => h('a', { class: 'lp-link', href }, label, svg(ICON.arrowRight));

  // ---- 1. Hero ----
  const daysLabel = `${days >= 0 ? s.beforeFirstRound : s.afterFirstRound} · ${fmtDate(firstRound)}`;
  const heroText = h('div', { class: 'lp-hero-text' },
    h('p', { class: 'lp-badge' }, h('img', { src: IMG.flag.src, width: 20, height: 12, alt: im.flagAlt, decoding: 'async' }), s.eyebrow),
    h('h1', null, s.title),
    h('p', { class: 'lp-lead' }, fmt(s.sub, { n })),
    h('div', { class: 'lp-actions' },
      h('a', { class: 'btn btn-primary lp-btn', href: '#start' }, s.cta, svg(ICON.arrowRight)),
      h('a', { class: 'btn lp-btn lp-btn-line', href: '#candidates' }, lp.seeCandidates)),
    h('ul', { class: 'lp-trust' }, ...[lp.trust1, lp.trust2, lp.trust3].map((t) => h('li', null, svg(ICON.check), t))));
  // Six portraits in the shuffled order (a different six on every visit), all treated the same way.
  const faces = order.filter((x) => x.photo).slice(0, 6);
  const face = (x: Candidate, i: number) => h('button', { class: 'lp-face', type: 'button', style: `--i:${i}`, 'aria-haspopup': 'dialog', 'aria-label': x.name, title: x.name, onclick: () => openProfile(x) },
    h('img', { src: `/photos/${x.photo}`, alt: '', width: 320, height: 400, loading: i < 3 ? 'eager' : 'lazy', decoding: 'async' }));
  const liveHero = h('span', { class: 'live' }, h('i', { 'aria-hidden': 'true' }), s.live);
  const visual = h('div', { class: 'lp-visual' },
    h('div', { class: 'lp-mosaic' }, ...faces.map(face)),
    h('div', { class: 'lp-float lp-float-live', 'aria-live': 'polite' }, liveHero, votesNum(), h('span', null, s.participants)),
    h('div', { class: 'lp-float lp-float-days' }, well(ICON.calendar), h('div', null, h('b', { class: 'num' }, fmt(s.daysLeft, { n: fmtNumber(Math.abs(days)) })), h('span', null, daysLabel))));
  const hero = h('section', { class: 'lp-hero' }, h('div', { class: 'wrap lp-hero-grid' }, heroText, visual));

  // ---- 2. Numbers strip ----
  const stat = (num: HTMLElement, label: string) => h('div', { class: 'lp-stat' }, num, h('span', null, label));
  const numbers = h('section', { class: 'lp-numbers', 'aria-label': lp.numbersLabel },
    stat(votesNum(), s.participants),
    stat(h('b', { class: 'num' }, fmtNumber(n)), s.candidates),
    stat(answersNum(), s.pollAnswers),
    stat(h('b', { class: 'num' }, fmtNumber(Math.max(0, days))), lp.daysLabel));

  // ---- 3. The people's vote: Top 5, the weekly poll, the newest votes ----
  const liveTop = h('span', { class: 'live' }, h('i', { 'aria-hidden': 'true' }), s.live);
  const list = h('div', { class: 'stack top-list' }, ...Array.from({ length: TOP }, (_, i) => skeletonRow(i)));
  const topCard = h('div', { class: 'lp-card lp-top' }, h('div', { class: 'lp-card-head' }, h('h3', null, lp.top5), liveTop), list);

  const pollMeta = h('span', { class: 'lp-meta num' });
  const pollBody = h('div', { class: 'board-poll-body' }, skeletonLines(3));
  const pollCard = h('div', { class: 'lp-card lp-poll' }, h('div', { class: 'lp-card-head' }, h('h3', null, s.pollCard), pollMeta), pollBody, more('#poll', b.allPolls));
  const feed = h('ul', { class: 'feed' }, skeletonLines(3));
  const feedCard = h('div', { class: 'lp-card lp-feed' }, h('div', { class: 'lp-card-head' }, h('h3', null, b.recent)), feed);

  const liveSec = h('section', { class: 'lp-sec lp-live', 'aria-labelledby': 'lp-live-title' },
    h('div', { class: 'lp-sec-head row' },
      h('div', null, kicker(b.title), h('h2', { id: 'lp-live-title' }, lp.liveTitle), h('p', { class: 'lp-sub' }, s.topSub)),
      more('#results', s.seeAllResults)),
    h('div', { class: 'lp-live-grid' }, topCard, h('div', { class: 'lp-live-side' }, pollCard, feedCard)));

  // Poll interaction: percentages only after answering (no nudging)
  let poll: PollInfo | null = null;
  let myAnswer: string | null = null;
  let storage: StorageAdapter | null = null;
  const drawPoll = () => {
    clear(pollBody);
    if (!poll) {
      pollMeta.textContent = '';
      pollBody.append(h('p', { class: 'board-q' }, b.noPoll), h('p', { class: 'board-empty' }, b.noPollSub));
      return;
    }
    const p = poll;
    pollMeta.textContent = fmt(S().poll.answers, { n: fmtNumber(p.total) });
    const show = myAnswer !== null;
    const opts = h('div', { class: 'popts', role: 'radiogroup', 'aria-label': l(p.question) });
    for (const o of p.options) {
      const mine = myAnswer === o.id;
      const pc = pct(p.counts[o.id] ?? 0, p.total);
      opts.append(h('button', { class: show ? 'popt show' : 'popt', type: 'button', role: 'radio', 'aria-checked': String(mine), 'aria-pressed': String(mine), onclick: () => void answer(o.id) },
        h('i', { class: 'fill', style: `width:${show ? pc : 0}%` }),
        h('span', { class: 'lbl' }, mine ? svg(ICON.check) : null, l(o.label)),
        h('span', { class: 'pct num' }, asPct(pc))));
    }
    pollBody.append(h('p', { class: 'board-q' }, l(p.question)), opts, h('p', { class: 'board-empty' }, show ? b.voted : b.answerHint));
  };
  const answer = async (optionId: string) => {
    if (!poll || optionId === myAnswer) return;
    const p = poll;
    try {
      storage ??= await getStorage();
      await storage.ready();
      await storage.savePollAnswer(p.id, optionId);
      if (myAnswer) p.counts[myAnswer] = Math.max(0, (p.counts[myAnswer] ?? 1) - 1); else p.total += 1;
      p.counts[optionId] = (p.counts[optionId] ?? 0) + 1;
      myAnswer = optionId;
      writeMyAnswer(p.id, optionId);
      drawPoll();
      toast(S().poll.saved);
    } catch (e) { console.error(e); toast(S().vote.errorSave, 5000); }
  };

  const drawFeed = (items: FeedItem[]) => {
    clear(feed);
    if (!items.length) { feed.append(h('li', { class: 'board-empty' }, b.noRecent)); return; }
    items.forEach((it, i) => feed.append(h('li', { style: `--i:${i}` }, h('span', { class: 'dep' }, deptLabel(it.department)), h('span', null, b.justVoted), h('span', { class: 'when' }, timeAgo(it.at)))));
  };

  const rows = new Map<string, TopRow>();
  let drawn = 0;
  const draw = (res: Counts) => {
    const first = drawn++ === 0;
    const mine = state.myVote?.candidate ?? null;
    const ranked = order.map((x) => ({ x, n: res.counts[x.id] ?? 0 })).sort((a, b2) => b2.n - a.n);
    showVotes(res.total);
    clear(list);
    if (res.total === 0) {
      list.append(h('div', { class: 'empty-top' }, note(s.noVotesYet, ICON.ballot, false),
        h('a', { class: 'btn btn-primary', href: '#start' }, s.firstVote, svg(ICON.arrowRight))));
      return;
    }
    list.classList.toggle('enter', first);
    ranked.slice(0, TOP).forEach(({ x, n: votes }, i) => {
      let row = rows.get(x.id);
      if (!row) { row = topRow(x, i); rows.set(x.id, row); }
      const p = pct(votes, res.total);
      row.el.style.setProperty('--i', String(i));
      row.el.classList.toggle('mine', x.id === mine);
      row.barEl.className = p ? 'on' : '';
      row.barEl.style.width = `${p}%`;
      row.bar.setAttribute('aria-label', `${x.name}: ${p} %`);
      row.stop();
      row.stop = tween(row.pctEl, first ? 0 : row.value, p, first ? 900 + i * 90 : 600, asPct);
      row.value = p;
      list.append(row.el);
    });
  };

  const ids = c.candidates.map((x) => x.id);
  const cached = readTopCache();
  let lastAt = 0;
  const refresh = async () => {
    if (!alive) return;
    const [r, f] = await Promise.all([loadCounts(ids), loadFeed().catch(() => [] as FeedItem[])]);
    if (!alive) return;
    if (r) { lastAt = r.at; writeTopCache(r); draw(r); for (const el of [liveHero, liveTop]) el.classList.add('on'); }
    else if (drawn === 0) { clear(list); list.append(note(S().offline)); }
    drawFeed(f);
  };
  const startLive = () => {
    if (cached) { lastAt = cached.at; draw(cached); }
    void refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible' && Date.now() - lastAt > 30_000) void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    cleanups.push(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); });
    void loadPoll().then((p) => { if (!alive) return; poll = p; myAnswer = p ? readMyAnswer(p.id) : null; drawPoll(); }).catch(() => { if (alive) { poll = null; drawPoll(); } });
  };
  // The live reads wait for the first paint (they are not needed for layout).
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => { if (alive) startLive(); }, { timeout: 1200 });
  else window.setTimeout(() => { if (alive) startLive(); }, 300);

  // ---- 4. The two games ----
  const q = S().quiz;
  const d = S().dash;
  const qs = quizStatus();
  const quizLine = qs.done ? (qs.score === null ? fmt(d.quizDoneNoScore, { d: qs.day }) : fmt(d.quizDone, { d: qs.day, s: qs.score }))
    : qs.answered ? fmt(d.quizProgress, { d: qs.day, a: qs.answered }) : fmt(d.quizNew, { d: qs.day });
  const games = h('section', { class: 'lp-sec', 'aria-labelledby': 'lp-games-title' },
    h('div', { class: 'lp-sec-head' }, kicker(lp.gamesKicker), h('h2', { id: 'lp-games-title' }, lp.gamesTitle)),
    h('div', { class: 'lp-games' },
      h('a', { class: 'lp-card lp-game', href: '#quiz' },
        h('div', { class: 'lp-game-top' }, well(ICON.idea), qs.streak > 0 ? h('span', { class: 'qz-streak' }, svg(ICON.flame), fmt(q.streak, { n: qs.streak })) : null),
        h('h3', null, q.title), h('p', null, q.lead),
        h('div', { class: 'lp-segs', 'aria-hidden': 'true' }, ...Array.from({ length: qs.total }, (_, i) => h('i', { class: i < qs.answered ? 'on' : '' }))),
        h('p', { class: 'lp-game-status' }, quizLine),
        h('span', { class: 'btn btn-primary lp-btn' }, qs.done ? d.seeResults : qs.answered ? d.keepGoing : lp.playToday, svg(ICON.arrowRight))),
      h('a', { class: 'lp-game lp-game-solid', href: '#president' },
        h('span', { class: 'lp-game-icon', 'aria-hidden': 'true' }, svg(ICON.palace)),
        h('h3', null, s.presTitle), h('p', null, s.presSub),
        h('span', { class: 'btn lp-btn lp-btn-white' }, s.presCta, svg(ICON.arrowRight)))));

  // ---- 5. Candidates: every one, random order, one slow loop; pauses on hover or focus ----
  const half = (clone: boolean) => h('div', { class: 'marquee-half', 'aria-hidden': clone ? 'true' : undefined },
    ...order.map((x) => h('button', { class: 'strip-av', type: 'button', title: x.name, tabindex: clone ? -1 : undefined, 'aria-haspopup': 'dialog', onclick: () => openProfile(x) }, avatar(x), h('span', { class: 'sr' }, x.name))));
  const cands = h('section', { class: 'lp-sec lp-cands', 'aria-labelledby': 'lp-cands-title' },
    h('div', { class: 'lp-sec-head row' },
      h('div', null, kicker(lp.candKicker), h('h2', { id: 'lp-cands-title' }, fmt(lp.candTitle, { n })), h('p', { class: 'lp-sub' }, lp.candSub)),
      more('#candidates', lp.seeAllCandidates)),
    h('div', { class: 'marquee', 'aria-label': s.stripLabel }, h('div', { class: 'marquee-track' }, half(false), half(true))));

  // ---- 6. Why the real vote matters (shared with the dashboard and the game; open columns here) ----
  const why = whyVote();
  why.classList.add('lp-sec', 'lp-why');

  // ---- 7. Kat sitwayen: made once signed in (it lives on the dashboard); here, an invitation with a small preview ----
  const cs = S().card;
  const cardInvite = h('section', { class: 'lp-sec cc-invite', 'aria-labelledby': 'cc-invite-title' },
    h('div', { class: 'cc-mini', 'aria-hidden': 'true' },
      h('span', { class: 'cc-mini-top' }, svg(ICON.brand), S().appName.toUpperCase(), h('img', { src: IMG.flag.src, width: 22, height: 13, alt: '', decoding: 'async' })),
      h('span', { class: 'cc-mini-label' }, cs.onCard), h('b', null, cs.defaultName),
      h('span', { class: 'cc-mini-photo' }, svg(ICON.photo)), h('span', { class: 'cc-mini-seal' }, '2027')),
    h('div', { class: 'cc-invite-text' },
      h('p', { class: 'kicker lp-kicker' }, cs.kicker), h('h2', { id: 'cc-invite-title' }, cs.title), h('p', null, signed ? cs.inviteSigned : cs.inviteLead),
      h('div', { class: 'cc-invite-actions' }, ...(signed
        ? [h('a', { class: 'btn btn-primary', href: '#dashboard' }, S().account.myDashboard, svg(ICON.arrowRight))]
        : [h('button', { class: 'btn btn-primary', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp),
          h('button', { class: 'btn btn-outline', type: 'button', onclick: () => openAccountSheet('in') }, S().account.signIn)]))));

  // ---- 8. Who we are, with the Citadelle (CC BY 2.0) and the next dates ----
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = c.dates.filter((x) => x.date >= today).slice(0, 3);
  const photo = h('figure', { class: 'lp-photo' },
    h('picture', null,
      h('source', { media: '(min-width: 1024px)', srcset: `${IMG.citadelle.src640} 640w, ${IMG.citadelle.src1200} 1200w`, sizes: '560px' }),
      h('img', { src: IMG.citadelle.src640, srcset: `${IMG.citadelle.src640} 640w, ${IMG.citadelle.src1200} 1200w`, sizes: '100vw', width: 640, height: 427, alt: im.citadelle, loading: 'lazy', decoding: 'async' })),
    h('figcaption', null, h('strong', null, im.citadelle), h('span', null, im.citadelleCredit)));
  const about = h('section', { class: 'lp-sec lp-about', 'aria-labelledby': 'lp-about-title' },
    photo,
    h('div', { class: 'lp-about-text' },
      kicker(S().nav.aboutUs), h('h2', { id: 'lp-about-title' }, lp.aboutTitle), h('p', { class: 'lp-lead' }, lp.aboutText),
      more('#about', s.aboutCard),
      upcoming.length ? h('div', { class: 'lp-dates' }, h('h3', null, s.nextDates),
        h('ul', null, ...upcoming.map((x) => h('li', null, h('b', { class: 'num' }, fmtDate(x.date)), h('span', null, l(x.label)))))) : null,
      h('p', { class: 'lp-note' }, svg(ICON.info), s.note)));

  // ---- 9. The one dark band: the call to action ----
  const final = h('section', { class: 'lp-final', 'aria-labelledby': 'lp-final-title' },
    h('h2', { id: 'lp-final-title' }, lp.ctaTitle), h('p', null, lp.ctaText),
    h('div', { class: 'lp-actions' },
      h('a', { class: 'btn lp-btn lp-btn-white', href: '#start' }, s.cta, svg(ICON.arrowRight)),
      signed ? h('a', { class: 'btn lp-btn lp-btn-ghost', href: '#dashboard' }, S().account.myDashboard)
        : h('button', { class: 'btn lp-btn lp-btn-ghost', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp)));

  main.append(hero, h('div', { class: 'wrap lp-body' }, numbers, liveSec, games, cands, why, cardInvite, about, final, footer()));
  cleanups.push(revealOnScroll([liveSec, games, cands, why, cardInvite, about, final]));

  void loadStats().then((st) => {
    if (!alive) return;
    for (const el of answersEls) el.textContent = st.pollAnswers === null ? '·' : fmtNumber(st.pollAnswers);
    if (st.votes !== null && votesShown === 0 && drawn === 0) showVotes(st.votes);
  });
  return () => { alive = false; for (const f of stopVotes) f(); for (const f of cleanups) f(); for (const r of rows.values()) r.stop(); };
}
