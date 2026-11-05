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
import { attachTilt } from '../lib/tilt';
import { toast } from './toast';
import { civicCard } from './civic-card';
import { whyVote } from './why-vote';

// Faint wrought-iron lace, inline (no image request), masked to fade before the bottom.
const LACE = '<svg class="hero-lace" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="lace2" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M0 28A28 28 0 0 0 28 0M28 0A28 28 0 0 0 56 28M56 28A28 28 0 0 0 28 56M28 56A28 28 0 0 0 0 28" fill="none" stroke="#fff" stroke-width="1"/><circle cx="28" cy="28" r="6" fill="none" stroke="#fff" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#lace2)"/></svg>';

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
function tween(el: HTMLElement, from: number, to: number, ms: number, format: (n: number) => string): () => void {
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

/** Compact row for the hero board: identical for every candidate. */
function boardRow(c: Candidate, p: number, mine: boolean): HTMLElement {
  return h('button', { class: mine ? 'brow mine' : 'brow', type: 'button', 'aria-haspopup': 'dialog', onclick: () => openProfile(c) },
    avatar(c), h('span', { class: 'bname' }, c.name, h('small', null, c.party)), h('span', { class: 'bpct num' }, asPct(p)),
    h('span', { class: 'bbar', role: 'img', 'aria-label': `${c.name}: ${p} %` }, h('i', { style: `width:${p}%` })));
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

/** Section title with a small uppercase kicker above it. */
const secHead = (kicker: string, title: string) => h('div', { class: 'sec-head' }, h('p', { class: 'kicker' }, kicker), h('h2', null, title));

const stagger = (parent: HTMLElement) => Array.from(parent.children).forEach((el, i) => (el as HTMLElement).style.setProperty('--i', String(i)));

export function renderHome(main: HTMLElement): () => void {
  clear(main);
  const s = S().home;
  const b = S().board;
  const im = S().images;
  const c = content();
  const n = c.candidates.length;
  let alive = true;
  const cleanups: (() => void)[] = [];

  const firstRound = c.dates.find((d) => d.date === FIRST_ROUND)?.date ?? FIRST_ROUND;
  const days = daysUntil(firstRound);
  const deptLabel = (id: string) => { const d = c.departments.find((x) => x.id === id); return d && d.id !== 'na' ? l(d.label) : b.someone; };

  // Two sets of live-number elements: tiles on phones, an inline row inside the hero card on desktop.
  const votesEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const answersEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const statRow = (cls: string, i: number) => h('div', { class: cls },
    h('div', { class: 'stat-tile' }, votesEls[i], h('span', null, s.participants)),
    h('div', { class: 'stat-tile' }, h('b', { class: 'num' }, fmtNumber(n)), h('span', null, s.candidates)),
    h('div', { class: 'stat-tile' }, answersEls[i], h('span', null, s.pollAnswers)));
  const countdownRow = () => h('div', { class: 'countdown' }, well(ICON.calendar),
    h('div', null,
      h('b', { class: 'num' }, fmt(s.daysLeft, { n: fmtNumber(Math.abs(days)) })),
      h('span', null, days >= 0 ? s.beforeFirstRound : s.afterFirstRound),
      h('small', { class: 'num' }, fmtDate(firstRound))));

  // ---- Hero: the question on the left, the live board of the voters on the right ----
  const deskCountdown = h('div', { class: 'card countdown-card desk-only' }, countdownRow(), statRow('stats-inline', 1));
  cleanups.push(attachTilt(deskCountdown, 5));
  const heroText = h('div', { class: 'hero-text intro' },
    h('p', { class: 'eyebrow' }, h('img', { class: 'flag', src: IMG.flag.src, srcset: IMG.flag.srcset, sizes: '40px', width: 40, height: 24, alt: im.flagAlt, decoding: 'async' }), s.eyebrow),
    h('h1', null, s.title),
    h('p', null, fmt(s.sub, { n })),
    h('div', { class: 'hero-actions' },
      h('a', { class: 'btn btn-primary hero-cta', href: '#start' }, s.cta, svg(ICON.arrowRight)),
      h('a', { class: 'hero-link', href: '#results' }, s.seeResults, svg(ICON.outward))),
    deskCountdown);
  stagger(heroText);

  // Board 1: the people's vote (participants, top 3)
  const live = h('span', { class: 'live' }, h('i', { 'aria-hidden': 'true' }), s.live);
  const bigNum = h('b', { class: 'board-num num' }, '·');
  const top3 = h('div', { class: 'board-top' }, skeletonLines(3));
  const boardVote = h('article', { class: 'board' },
    h('div', { class: 'board-head' }, h('span', { class: 'board-kicker' }, b.title), live),
    h('div', { class: 'board-stat' }, bigNum, h('span', null, s.participants)),
    h('p', { class: 'board-sub' }, b.top3),
    top3,
    h('a', { class: 'board-link', href: '#results' }, s.seeAllResults, svg(ICON.arrowRight)));

  // Board 2: the weekly poll, answerable in place; percentages only after answering (no nudging)
  const pollMeta = h('span', { class: 'board-meta num' });
  const pollBody = h('div', { class: 'board-poll-body' }, skeletonLines(3));
  const boardPoll = h('article', { class: 'board board-poll' },
    h('div', { class: 'board-head' }, h('span', { class: 'board-kicker' }, s.pollCard), pollMeta),
    pollBody,
    h('a', { class: 'board-link', href: '#poll' }, b.allPolls, svg(ICON.arrowRight)));

  // Board 3: the latest votes, by department only
  const feed = h('ul', { class: 'feed' }, skeletonLines(3));
  const boardFeed = h('article', { class: 'board board-feed' },
    h('div', { class: 'board-head' }, h('span', { class: 'board-kicker' }, b.recent)),
    feed);

  const boardCol = h('aside', { class: 'board-col intro', 'aria-label': b.title }, boardVote, boardPoll, boardFeed);
  stagger(boardCol);
  for (const el of [boardVote, boardPoll, boardFeed]) cleanups.push(attachTilt(el, 3));

  const hero = h('section', { class: 'hero hero-home', html: LACE });
  hero.append(h('div', { class: 'wrap hero-grid' }, heroText, boardCol));

  // Poll interaction
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

  // Feed
  const drawFeed = (items: FeedItem[]) => {
    clear(feed);
    if (!items.length) { feed.append(h('li', { class: 'board-empty' }, b.noRecent)); return; }
    items.forEach((it, i) => feed.append(h('li', { style: `--i:${i}` }, h('span', { class: 'dep' }, deptLabel(it.department)), h('span', null, b.justVoted), h('span', { class: 'when' }, timeAgo(it.at)))));
  };

  // ---- Candidates strip: every candidate, random order, one slow loop; pauses on hover or focus ----
  const order = candidatesShuffled();
  const half = (clone: boolean) => h('div', { class: 'marquee-half', 'aria-hidden': clone ? 'true' : undefined },
    ...order.map((x) => h('button', { class: 'strip-av', type: 'button', title: x.name, tabindex: clone ? -1 : undefined, 'aria-haspopup': 'dialog', onclick: () => openProfile(x) }, avatar(x), h('span', { class: 'sr' }, x.name))));
  const strip = h('section', { class: 'section strip-sec', 'aria-label': s.stripLabel },
    h('p', { class: 'caption' }, fmt(s.stripCaption, { n })),
    h('div', { class: 'marquee' }, h('div', { class: 'marquee-track' }, half(false), half(true))));

  // ---- Top 5 by votes: skeleton first, cached numbers next, live numbers when they arrive ----
  const liveTop = h('span', { class: 'live' }, h('i', { 'aria-hidden': 'true' }), s.live);
  const list = h('div', { class: 'stack top-list' }, ...Array.from({ length: TOP }, (_, i) => skeletonRow(i)));
  const topLink = h('p', { class: 'top-link' }, h('a', { class: 'link-btn', href: '#results' }, s.seeAllResults, svg(ICON.arrowRight)));
  const top = h('section', { class: 'section top-sec main-col' },
    h('div', { class: 'top-head' }, secHead(s.topKicker, s.top), liveTop),
    h('p', { class: 'top-sub' }, s.topSub),
    list, topLink);

  const rows = new Map<string, TopRow>();
  let drawn = 0;
  let bigShown = 0;
  let stopBig = () => {};
  const draw = (res: Counts) => {
    const first = drawn++ === 0;
    const mine = state.myVote?.candidate ?? null;
    const ranked = order.map((x) => ({ x, n: res.counts[x.id] ?? 0 })).sort((a, b2) => b2.n - a.n);
    // the board
    stopBig(); stopBig = tween(bigNum, bigShown, res.total, 1100, fmtNumber); bigShown = res.total;
    clear(top3);
    if (res.total === 0) top3.append(h('p', { class: 'board-empty' }, s.noVotesYet));
    else for (const { x, n: v } of ranked.slice(0, 3)) top3.append(boardRow(x, pct(v, res.total), x.id === mine));
    // the Top 5
    clear(list);
    if (res.total === 0) {
      list.append(h('div', { class: 'card empty-top' }, note(s.noVotesYet, ICON.ballot, false),
        h('a', { class: 'btn btn-primary', href: '#start' }, s.firstVote, svg(ICON.arrowRight))));
      topLink.hidden = true;
      return;
    }
    topLink.hidden = false;
    list.classList.toggle('enter', first);
    ranked.slice(0, TOP).forEach(({ x, n: votes }, i) => {
      let row = rows.get(x.id);
      if (!row) { row = topRow(x, i); rows.set(x.id, row); cleanups.push(attachTilt(row.el, 3)); }
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
    if (r) { lastAt = r.at; writeTopCache(r); draw(r); live.classList.add('on'); liveTop.classList.add('on'); }
    else if (drawn === 0) { clear(list); list.append(note(S().offline)); topLink.hidden = true; clear(top3); top3.append(h('p', { class: 'board-empty' }, S().offline)); }
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

  const pollSub = h('span', null, s.pollSubNone);
  const entry = (href: string, icon: string, title: string, sub: Node | string) =>
    h('a', { class: 'card explore', href }, well(icon), h('span', { class: 'explore-text' }, h('strong', null, title), typeof sub === 'string' ? h('span', null, sub) : sub), svg(ICON.chevronRight, 'ico chev'));
  const explore = h('aside', { class: 'section side-col' }, secHead(s.exploreKicker, s.explore),
    h('div', { class: 'stack explore-grid' },
      entry('#candidates', ICON.people, s.candidatesCard, fmt(s.candidatesSub, { n })),
      entry('#poll', ICON.poll, s.pollCard, pollSub),
      entry('#results', ICON.ballot, s.resultsCard, s.resultsSub),
      entry('#quiz', ICON.idea, s.quizCard, s.quizSub),
      entry('#about', ICON.info, s.aboutCard, s.aboutSub)));
  for (const el of explore.querySelectorAll<HTMLElement>('.explore')) cleanups.push(attachTilt(el, 4));

  // ---- Konnen Ayiti: the daily game ----
  // The game and its question bank are their own chunk, loaded when the section comes near.
  const q = S().quiz;
  const quizHead = h('div', { class: 'qz-head' }, h('div', null, h('p', { class: 'kicker' }, q.kicker), h('h2', null, q.title), h('p', { class: 'qz-lead' }, q.lead)));
  const quizSlot = h('div', { class: 'qz-card qz-skel', 'aria-hidden': 'true' }, skeletonLines(4));
  const quizSec = h('section', { class: 'section qz-sec', id: 'jwet' }, quizHead, quizSlot);
  const mountQuiz = () => void import('./quiz').then((m) => {
    if (!alive) return;
    const g = m.quizGame();
    cleanups.push(g.destroy);
    quizHead.append(g.streakPill);
    quizSlot.replaceWith(g.el);
  }).catch((e) => console.warn('quiz load failed', e));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); mountQuiz(); } }, { rootMargin: '800px 0px' });
    io.observe(quizSec);
    cleanups.push(() => io.disconnect());
  } else mountQuiz();

  // ---- Kat sitwayen: the visitor's own civic card ----
  const card = civicCard(firstRound);
  cleanups.push(card.destroy);

  // Photo card: the Citadelle (CC BY 2.0). Wide crop on desktop, 3:2 on phones; lazy.
  const band = h('figure', { class: 'band' },
    h('picture', null,
      h('source', { media: '(min-width: 1024px)', srcset: `${IMG.band.src800} 800w, ${IMG.band.src1400} 1400w`, sizes: '1120px' }),
      h('img', { src: IMG.citadelle.src640, srcset: `${IMG.citadelle.src640} 640w, ${IMG.citadelle.src1200} 1200w`, sizes: '100vw', width: 640, height: 427, alt: im.citadelle, loading: 'lazy', decoding: 'async' })),
    h('figcaption', null, h('strong', null, im.citadelle), h('span', null, im.citadelleCredit)));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = c.dates.filter((d) => d.date >= today).slice(0, 3);
  const dates = upcoming.length ? h('section', { class: 'section main-col' }, secHead(s.datesKicker, s.nextDates),
    h('div', { class: 'card' },
      h('ul', { class: 'timeline' }, ...upcoming.map((d) => h('li', null, h('b', null, fmtDate(d.date)), h('span', null, l(d.label))))),
      h('hr', { class: 'hr' }),
      h('a', { class: 'link-btn', href: '#about' }, s.allDates, svg(ICON.arrowRight)))) : h('div', { class: 'main-col' });
  const bottom = h('div', { class: 'layout-2 wide-side' }, dates, h('aside', { class: 'side-col section' }, note(s.note)));

  // ---- « Si m te prezidan »: a flat ultramarine band that opens the decision game ----
  const promo = h('a', { class: 'promo', href: '#president' },
    h('span', { class: 'promo-icon', 'aria-hidden': 'true' }, svg(ICON.palace)),
    h('span', { class: 'promo-text' }, h('span', { class: 'promo-kicker' }, s.presKicker), h('strong', null, s.presTitle), h('span', null, s.presSub)),
    h('span', { class: 'btn promo-btn' }, s.presCta, svg(ICON.arrowRight)));
  const why = whyVote();

  const mobileStats = h('div', { class: 'mobile-only stats-mobile' }, h('div', { class: 'card countdown-card' }, countdownRow()), statRow('stats3', 0));
  main.append(
    hero,
    h('div', { class: 'wrap home-body' }, mobileStats, strip, h('div', { class: 'home-top' }, top, explore), promo, quizSec),
    card.el,
    h('div', { class: 'wrap home-body' }, why, band, bottom, footer()));
  cleanups.push(revealOnScroll([promo, why, band, bottom]), attachTilt(band, 3));

  void loadStats().then((st) => {
    if (!alive) return;
    for (const el of votesEls) el.textContent = st.votes === null ? '·' : fmtNumber(st.votes);
    for (const el of answersEls) el.textContent = st.pollAnswers === null ? '·' : fmtNumber(st.pollAnswers);
    if (st.votes !== null && bigShown === 0 && drawn === 0) { stopBig(); stopBig = tween(bigNum, 0, st.votes, 1100, fmtNumber); bigShown = st.votes; }
  });
  return () => { alive = false; stopBig(); for (const f of cleanups) f(); for (const r of rows.values()) r.stop(); };
}
