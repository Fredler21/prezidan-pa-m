import type { L10n } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, fmtNumber, l } from '../i18n';
import { content } from '../content';
import { firebaseConfig } from '../firebase-config';
import { countDocuments, findActive, type RestConfig } from '../content/firestore-rest';
import { STORAGE_MODE, getStorage } from '../storage';
import { FIRST_ROUND } from '../data/dates';
import { note, footer, well } from './common';

// Faint wrought-iron lace, inline (no image request), masked to fade before the bottom.
const LACE = '<svg class="hero-lace" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="lace2" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M0 28A28 28 0 0 0 28 0M28 0A28 28 0 0 0 56 28M56 28A28 28 0 0 0 28 56M28 56A28 28 0 0 0 0 28" fill="none" stroke="#fff" stroke-width="1"/><circle cx="28" cy="28" r="6" fill="none" stroke="#fff" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#lace2)"/></svg>';

const REST: RestConfig = { projectId: firebaseConfig.projectId, apiKey: firebaseConfig.apiKey, timeoutMs: 6000 };

interface HomeStats { votes: number | null; pollAnswers: number | null; pollQuestion: L10n | null }

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

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function renderHome(main: HTMLElement): () => void {
  clear(main);
  const s = S().home;
  const c = content();
  const n = c.candidates.length;
  let alive = true;

  const firstRound = c.dates.find((d) => d.date === FIRST_ROUND)?.date ?? FIRST_ROUND;
  const days = daysUntil(firstRound);

  // Two sets of live-number elements: tiles on phones, an inline row inside the hero card on desktop.
  const votesEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const answersEls = [h('b', { class: 'num' }, '·'), h('b', { class: 'num' }, '·')];
  const statRow = (cls: string, i: number) => h('div', { class: cls },
    h('div', { class: 'stat-tile' }, votesEls[i], h('span', null, s.participants)),
    h('div', { class: 'stat-tile' }, h('b', { class: 'num' }, fmtNumber(n)), h('span', null, s.candidates)),
    h('div', { class: 'stat-tile' }, answersEls[i], h('span', null, s.pollAnswers)));

  const panel = h('div', { class: 'hero-panel' },
    h('div', { class: 'card countdown-card' },
      h('div', { class: 'countdown' }, well(ICON.calendar),
        h('div', null,
          h('b', { class: 'num' }, fmt(s.daysLeft, { n: fmtNumber(Math.abs(days)) })),
          h('span', null, days >= 0 ? s.beforeFirstRound : s.afterFirstRound),
          h('small', { class: 'num' }, fmtDate(firstRound)))),
      statRow('stats-inline desk-only', 1)));

  const hero = h('section', { class: 'hero hero-home', html: LACE });
  hero.append(h('div', { class: 'wrap hero-grid' },
    h('div', { class: 'hero-text' },
      h('h1', null, s.title),
      h('p', null, fmt(s.sub, { n })),
      h('div', { class: 'hero-actions' },
        h('a', { class: 'btn btn-primary hero-cta', href: '#start' }, s.cta, svg(ICON.arrowRight)),
        h('a', { class: 'hero-link', href: '#results' }, s.seeResults, svg(ICON.outward)))),
    panel));

  const how = h('section', { class: 'section how' }, h('h2', null, s.how),
    h('div', { class: 'card' }, h('ul', { class: 'steps rows' },
      h('li', null, well(ICON.sliders), h('span', null, s.how1)),
      h('li', null, well(ICON.people), h('span', null, s.how2)),
      h('li', null, well(ICON.ballot), h('span', null, s.how3)))));

  const pollSub = h('span', null, s.pollSubNone);
  const entry = (href: string, icon: string, title: string, sub: Node | string) =>
    h('a', { class: 'card explore', href }, well(icon), h('span', { class: 'explore-text' }, h('strong', null, title), typeof sub === 'string' ? h('span', null, sub) : sub), svg(ICON.chevronRight, 'ico chev'));
  const explore = h('section', { class: 'section' }, h('h2', null, s.explore),
    h('div', { class: 'stack explore-grid' },
      entry('#candidates', ICON.people, s.candidatesCard, fmt(s.candidatesSub, { n })),
      entry('#poll', ICON.poll, s.pollCard, pollSub),
      entry('#results', ICON.ballot, s.resultsCard, s.resultsSub),
      entry('#about', ICON.info, s.aboutCard, s.aboutSub)));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = c.dates.filter((d) => d.date >= today).slice(0, 3);
  const dates = upcoming.length ? h('section', { class: 'section main-col' }, h('h2', null, s.nextDates),
    h('div', { class: 'card' },
      h('ul', { class: 'timeline' }, ...upcoming.map((d) => h('li', null, h('b', null, fmtDate(d.date)), h('span', null, l(d.label))))),
      h('hr', { class: 'hr' }),
      h('a', { class: 'link-btn', href: '#about' }, s.allDates, svg(ICON.arrowRight)))) : h('div', { class: 'main-col' });
  const bottom = h('div', { class: 'layout-2 wide-side' }, dates, h('aside', { class: 'side-col section' }, note(s.note)));

  main.append(hero, h('div', { class: 'wrap home-body' }, statRow('stats3 mobile-only', 0), how, explore, bottom, footer()));

  void loadStats().then((st) => {
    if (!alive) return;
    for (const el of votesEls) el.textContent = st.votes === null ? '·' : fmtNumber(st.votes);
    for (const el of answersEls) el.textContent = st.pollAnswers === null ? '·' : fmtNumber(st.pollAnswers);
    if (st.pollQuestion) pollSub.textContent = l(st.pollQuestion);
  });
  return () => { alive = false; };
}
