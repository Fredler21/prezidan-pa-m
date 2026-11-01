import type { Candidate, L10n } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, fmtNumber, l } from '../i18n';
import { content, candidatesShuffled } from '../content';
import { firebaseConfig } from '../firebase-config';
import { countDocuments, findActive, getDocumentQuiet, type RestConfig } from '../content/firestore-rest';
import { STORAGE_MODE, getStorage } from '../storage';
import { FIRST_ROUND } from '../data/dates';
import { IMG } from '../data/images';
import { pct } from '../lib/util';
import { state } from '../state';
import { note, footer, well, avatar } from './common';
import { openProfile } from './profile';
import { attachTilt } from '../lib/tilt';

// Faint wrought-iron lace, inline (no image request), masked to fade before the bottom.
const LACE = '<svg class="hero-lace" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="lace2" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M0 28A28 28 0 0 0 28 0M28 0A28 28 0 0 0 56 28M56 28A28 28 0 0 0 28 56M28 56A28 28 0 0 0 0 28" fill="none" stroke="#fff" stroke-width="1"/><circle cx="28" cy="28" r="6" fill="none" stroke="#fff" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#lace2)"/></svg>';

const REST: RestConfig = { projectId: firebaseConfig.projectId, apiKey: firebaseConfig.apiKey, timeoutMs: 6000 };
const TOP = 5;
const TOP_CACHE = 'ppm.top.v1';
const TOP_TTL_MS = 5 * 60_000;
const REFRESH_MS = 60_000;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

interface HomeStats { votes: number | null; pollAnswers: number | null; pollQuestion: L10n | null }
interface Counts { counts: Record<string, number>; total: number; at: number }

/** Live numbers without the Firebase SDK: REST count() queries in Firebase mode, the local adapter in demo mode. */
async function loadStats(): Promise<HomeStats> {
  if (STORAGE_MODE === 'local') {
    const st = await getStorage();
    const poll = await st.getActivePoll();
    const votes = await new Promise<number>((resolve) => { const off = st.subscribeVotes((r) => { off(); resolve(r.total); }); });
    let answers: number | null = null;
    if (poll) answers = await new Promise<number>((resolve) => { const off = st.subscribePollResults(poll.id, (r) => { off(); resolve(r.total); }); });
    return { votes, pollAnswers: answers ?? 0, pollQuestion: poll ? poll.question : null };
  }
  const [votes, poll] = await Promise.all([countDocuments(REST, 'votes'), findActive(REST, 'polls', 'active', 'startsAt')]);
  let answers: number | null = 0; // no active poll means no answers
  let question: L10n | null = null;
  if (poll.ok && poll.value) {
    const q = poll.value.data.question;
    if (q && typeof q === 'object') question = q as L10n;
    const c = await countDocuments(REST, 'pollVotes', { field: 'pollId', equals: poll.value.id });
    answers = c.ok ? c.value : null;
  }
  return { votes: votes.ok ? votes.value : null, pollAnswers: answers, pollQuestion: question };
}

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

/**
 * Votes per candidate for the Top 5, still without the SDK. A stats/presidential document
 * (maintained by Functions when they run) costs one read; otherwise one count() per candidate.
 */
async function loadCounts(ids: readonly string[]): Promise<Counts | null> {
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

function readTopCache(): Counts | null {
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
function writeTopCache(c: Counts): void {
  try { localStorage.setItem(TOP_CACHE, JSON.stringify(c)); } catch { /* storage disabled or full */ }
}

/** Counts a percentage up (or down) in place; instant when the visitor prefers reduced motion. */
function tween(el: HTMLElement, from: number, to: number, ms: number): () => void {
  if (reducedMotion() || from === to) { el.textContent = `${to} %`; return () => {}; }
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(from + (to - from) * eased)} %`;
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

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

/** Reveals sections as they scroll into view (no-op without IntersectionObserver or with reduced motion). */
function revealOnScroll(els: HTMLElement[]): () => void {
  if (!('IntersectionObserver' in window) || reducedMotion()) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of els) { el.classList.add('fx'); io.observe(el); }
  return () => io.disconnect();
}

export function renderHome(main: HTMLElement): () => void {
  clear(main);
  const s = S().home;
  const im = S().images;
  const c = content();
  const n = c.candidates.length;
  let alive = true;
  const cleanups: (() => void)[] = [];

  const firstRound = c.dates.find((d) => d.date === FIRST_ROUND)?.date ?? FIRST_ROUND;
  const days = daysUntil(firstRound);

  // Two sets of live-number elements: tiles on phones, an inline row inside the hero card on desktop.
  const votesEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const answersEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const statRow = (cls: string, i: number) => h('div', { class: cls },
    h('div', { class: 'stat-tile' }, votesEls[i], h('span', null, s.participants)),
    h('div', { class: 'stat-tile' }, h('b', { class: 'num' }, fmtNumber(n)), h('span', null, s.candidates)),
    h('div', { class: 'stat-tile' }, answersEls[i], h('span', null, s.pollAnswers)));

  const countdown = h('div', { class: 'card countdown-card' },
    h('div', { class: 'countdown' }, well(ICON.calendar),
      h('div', null,
        h('b', { class: 'num' }, fmt(s.daysLeft, { n: fmtNumber(Math.abs(days)) })),
        h('span', null, days >= 0 ? s.beforeFirstRound : s.afterFirstRound),
        h('small', { class: 'num' }, fmtDate(firstRound)))),
    statRow('stats-inline desk-only', 1));
  // The 3D map (src/ui/haiti3d.ts) is its own chunk, mounted after first paint; the glow is CSS so nothing jumps.
  const map = h('div', { class: 'map3d', 'aria-hidden': 'true' }, h('div', { class: 'map3d-glow' }));
  const panel = h('div', { class: 'hero-panel' }, map, countdown);
  cleanups.push(attachTilt(countdown, 5));

  const hero = h('section', { class: 'hero hero-home', html: LACE });
  hero.append(h('div', { class: 'wrap hero-grid' },
    h('div', { class: 'hero-text' },
      h('p', { class: 'eyebrow' }, h('img', { class: 'flag', src: IMG.flag.src, srcset: IMG.flag.srcset, sizes: '40px', width: 40, height: 24, alt: im.flagAlt, decoding: 'async' }), s.eyebrow),
      h('h1', null, s.title),
      h('p', null, fmt(s.sub, { n })),
      h('div', { class: 'hero-actions' },
        h('a', { class: 'btn btn-primary hero-cta', href: '#start' }, s.cta, svg(ICON.arrowRight)),
        h('a', { class: 'hero-link', href: '#results' }, s.seeResults, svg(ICON.outward)))),
    panel));

  // Candidates strip: every candidate, random order, one slow loop; pauses on hover or focus.
  const order = candidatesShuffled();
  const half = (clone: boolean) => h('div', { class: 'marquee-half', 'aria-hidden': clone ? 'true' : undefined },
    ...order.map((x) => h('button', { class: 'strip-av', type: 'button', 'aria-label': x.name, title: x.name, tabindex: clone ? -1 : undefined, 'aria-haspopup': 'dialog', onclick: () => openProfile(x) }, avatar(x))));
  const strip = h('section', { class: 'section strip-sec', 'aria-label': s.stripLabel },
    h('p', { class: 'caption' }, fmt(s.stripCaption, { n })),
    h('div', { class: 'marquee' }, h('div', { class: 'marquee-track' }, half(false), half(true))));

  // Top 5 by votes: skeleton first, cached numbers next, live numbers when they arrive.
  const live = h('span', { class: 'live' }, h('i', { 'aria-hidden': 'true' }), s.live);
  const list = h('div', { class: 'stack top-list' }, ...Array.from({ length: TOP }, (_, i) => skeletonRow(i)));
  const topLink = h('p', { class: 'top-link' }, h('a', { class: 'link-btn', href: '#results' }, s.seeAllResults, svg(ICON.arrowRight)));
  const top = h('section', { class: 'section top-sec main-col' },
    h('div', { class: 'top-head' }, h('h2', null, s.top), live),
    h('p', { class: 'top-sub' }, s.topSub),
    list, topLink);

  const rows = new Map<string, TopRow>();
  let drawn = 0;
  const draw = (res: Counts) => {
    const first = drawn++ === 0;
    clear(list);
    if (res.total === 0) {
      list.append(h('div', { class: 'card empty-top' }, note(s.noVotesYet, ICON.ballot, false),
        h('a', { class: 'btn btn-primary', href: '#start' }, s.firstVote, svg(ICON.arrowRight))));
      topLink.hidden = true;
      return;
    }
    topLink.hidden = false;
    const mine = state.myVote?.candidate ?? null;
    const ranked = order.map((x) => ({ x, n: res.counts[x.id] ?? 0 })).sort((a, b) => b.n - a.n).slice(0, TOP);
    list.classList.toggle('enter', first);
    ranked.forEach(({ x, n: votes }, i) => {
      let row = rows.get(x.id);
      if (!row) { row = topRow(x, i); rows.set(x.id, row); cleanups.push(attachTilt(row.el, 3)); }
      const p = pct(votes, res.total);
      row.el.style.setProperty('--i', String(i));
      row.el.classList.toggle('mine', x.id === mine);
      row.barEl.className = p ? 'on' : '';
      row.barEl.style.width = `${p}%`;
      row.bar.setAttribute('aria-label', `${x.name}: ${p} %`);
      row.stop();
      row.stop = tween(row.pctEl, first ? 0 : row.value, p, first ? 900 + i * 90 : 600);
      row.value = p;
      list.append(row.el);
    });
  };

  const ids = c.candidates.map((x) => x.id);
  const cached = readTopCache();
  let lastAt = 0;
  const refresh = async () => {
    if (!alive) return;
    const r = await loadCounts(ids);
    if (!alive) return;
    if (r) { lastAt = r.at; writeTopCache(r); draw(r); live.classList.add('on'); }
    else if (drawn === 0) { clear(list); list.append(note(S().offline)); topLink.hidden = true; }
  };
  const start = () => {
    if (cached) { lastAt = cached.at; draw(cached); }
    if (!cached || Date.now() - cached.at > TOP_TTL_MS) void refresh(); else live.classList.add('on');
    const timer = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible' && Date.now() - lastAt > 30_000) void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    cleanups.push(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); });
  };
  // Start counting only once the section is near the viewport (saves reads on bounces).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '400px 0px' });
    io.observe(top);
    cleanups.push(() => io.disconnect());
  } else start();

  const pollSub = h('span', null, s.pollSubNone);
  const entry = (href: string, icon: string, title: string, sub: Node | string) =>
    h('a', { class: 'card explore', href }, well(icon), h('span', { class: 'explore-text' }, h('strong', null, title), typeof sub === 'string' ? h('span', null, sub) : sub), svg(ICON.chevronRight, 'ico chev'));
  const explore = h('aside', { class: 'section side-col' }, h('h2', null, s.explore),
    h('div', { class: 'stack explore-grid' },
      entry('#candidates', ICON.people, s.candidatesCard, fmt(s.candidatesSub, { n })),
      entry('#poll', ICON.poll, s.pollCard, pollSub),
      entry('#results', ICON.ballot, s.resultsCard, s.resultsSub),
      entry('#about', ICON.info, s.aboutCard, s.aboutSub)));
  for (const el of explore.querySelectorAll<HTMLElement>('.explore')) cleanups.push(attachTilt(el, 4));

  // Photo band: the Citadelle (public domain). Wide crop on desktop, 3:2 aerial on phones; lazy.
  const band = h('figure', { class: 'band' },
    h('picture', null,
      h('source', { media: '(min-width: 1024px)', srcset: `${IMG.band.src800} 800w, ${IMG.band.src1400} 1400w`, sizes: '1120px' }),
      h('img', { src: IMG.citadelle.src640, srcset: `${IMG.citadelle.src640} 640w, ${IMG.citadelle.src1200} 1200w`, sizes: '100vw', width: 640, height: 427, alt: im.citadelle, loading: 'lazy', decoding: 'async' })),
    h('figcaption', null, h('strong', null, im.citadelle), h('span', null, im.citadelleCredit)));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = c.dates.filter((d) => d.date >= today).slice(0, 3);
  const dates = upcoming.length ? h('section', { class: 'section main-col' }, h('h2', null, s.nextDates),
    h('div', { class: 'card' },
      h('ul', { class: 'timeline' }, ...upcoming.map((d) => h('li', null, h('b', null, fmtDate(d.date)), h('span', null, l(d.label))))),
      h('hr', { class: 'hr' }),
      h('a', { class: 'link-btn', href: '#about' }, s.allDates, svg(ICON.arrowRight)))) : h('div', { class: 'main-col' });
  const bottom = h('div', { class: 'layout-2 wide-side' }, dates, h('aside', { class: 'side-col section' }, note(s.note)));

  main.append(hero, h('div', { class: 'wrap home-body' }, statRow('stats3 mobile-only', 0), strip, h('div', { class: 'home-top' }, top, explore), band, bottom, footer()));
  cleanups.push(revealOnScroll([band, bottom]), attachTilt(band, 3));
  void import('./haiti3d').then((m) => { if (alive) cleanups.push(m.mountHaiti3D(map, { label: (id) => l(c.departments.find((d) => d.id === id)?.label) })); }).catch(() => { /* decorative only */ });

  void loadStats().then((st) => {
    if (!alive) return;
    for (const el of votesEls) el.textContent = st.votes === null ? '·' : fmtNumber(st.votes);
    for (const el of answersEls) el.textContent = st.pollAnswers === null ? '·' : fmtNumber(st.pollAnswers);
    if (st.pollQuestion) pollSub.textContent = l(st.pollQuestion);
  });
  return () => { alive = false; for (const f of cleanups) f(); for (const r of rows.values()) r.stop(); };
}
