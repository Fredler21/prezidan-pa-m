import type { Candidate } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, fmtNumber, fmtToday, l } from '../i18n';
import { state, onState, setMyVote } from '../state';
import { content, candidateById, candidatesShuffled } from '../content';
import { getStorage } from '../storage';
import { disconnect, type Account } from '../account';
import { FIRST_ROUND } from '../data/dates';
import { MAX_PICKS } from '../data/priorities';
import { PROFILES } from '../data/president-game';
import { cardMade, gameResult, markSeenCandidates, quizStatus, seenCandidates } from '../lib/progress';
import { daysUntil, initials, matchCandidates, pct } from '../lib/util';
import { avatar, footer, priorityLabel, well } from './common';
import { openProfile } from './profile';
import { loadCounts, readTopCache, writeTopCache, type Counts } from './home';
import { civicCard } from './civic-card';
import { whyVote } from './why-vote';
import { toast } from './toast';

/*
 * « Tablo mwen » (Stitch « s11-dashboard »): the home page once a visitor is signed in. One look
 * at where they stand: a six step civic journey, their own vote (only they see it), their
 * priorities, the candidates whose public record matches them, both games, the live results,
 * why the real vote matters, and their citizen card. Phone: one column in that order. Desktop:
 * an 8/4 split, journey, matches and games on the left, the personal cards on the right.
 */

const card = (cls: string, ...children: (Node | null)[]) => h('section', { class: `card dash-card ${cls}` }, ...children);
const cardHead = (title: string, link?: HTMLElement | null) => h('div', { class: 'dash-head' }, h('h2', null, title), link ?? null);
const linkTo = (href: string, label: string) => h('a', { class: 'dash-link', href }, label);

function ring(done: number, total: number): HTMLElement {
  const r = 30, c = 2 * Math.PI * r;
  const arc = done ? `<circle cx="36" cy="36" r="${r}" fill="none" stroke="var(--ultra)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - done / total)).toFixed(2)}" transform="rotate(-90 36 36)"/>` : '';
  return h('div', { class: 'dash-ring', role: 'img', 'aria-label': `${done}/${total}`, html: `<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="${r}" fill="none" stroke="var(--track)" stroke-width="7"/>${arc}</svg><b class="num">${done}/${total}</b>` });
}

export function renderDashboard(main: HTMLElement, account: Account): () => void {
  clear(main);
  const d = S().dash;
  const hs = S().home;
  let alive = true;
  const cleanups: (() => void)[] = [];
  const days = daysUntil(FIRST_ROUND);

  // ---- greeting ----
  const hour = new Date().getHours();
  const g = hour < 12 ? d.greetMorning : hour < 18 ? d.greetAfternoon : d.greetEvening;
  const firstName = account.name.trim().split(/\s+/)[0] ?? '';
  const mono = h('span', { class: 'dash-av', 'aria-hidden': 'true' }, initials(account.name || account.email.split('@')[0] || '·'));
  let av: HTMLElement = mono;
  if (account.photo) {
    const img = h('img', { class: 'dash-av', src: account.photo, alt: '', width: 56, height: 56, referrerpolicy: 'no-referrer', decoding: 'async' });
    img.addEventListener('error', () => img.replaceWith(mono), { once: true });
    av = img;
  }
  const q = quizStatus();
  const greet = h('header', { class: 'dash-greet' }, av,
    h('div', { class: 'dash-hello' },
      h('h1', null, firstName ? fmt(d.hello, { g, name: firstName }) : g),
      h('p', null, `${fmtToday()} · ${fmt(hs.daysLeft, { n: fmtNumber(Math.abs(days)) })} ${days >= 0 ? hs.beforeFirstRound : hs.afterFirstRound}`)),
    q.streak > 0 ? h('span', { class: 'qz-streak dash-streak' }, svg(ICON.flame), fmt(S().quiz.streak, { n: q.streak })) : null);

  // ---- citizen card (full width under the grid); the journey step scrolls to it ----
  const civic = civicCard(FIRST_ROUND);
  cleanups.push(civic.destroy);
  const toCard = () => civic.el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  // ---- civic journey ----
  const journeyBody = h('div');
  const journey = card('dash-journey', journeyBody);
  const drawJourney = () => {
    const quiz = quizStatus();
    const steps: { done: boolean; label: string; act: string; href?: string; onclick?: () => void }[] = [
      { done: state.picks.length >= MAX_PICKS, label: d.stepPicks, act: d.actGo, href: '#start' },
      { done: seenCandidates(), label: d.stepSeen, act: d.actGo, href: state.picks.length ? '#match' : '#candidates' },
      { done: !!state.myVote, label: d.stepVote, act: d.actGo, href: '#vote' },
      { done: quiz.done, label: d.stepQuiz, act: d.actPlay, href: '#quiz' },
      { done: !!gameResult(), label: d.stepGame, act: d.actPlay, href: '#president' },
      { done: cardMade(), label: d.stepCard, act: d.actStart, onclick: toCard },
    ];
    const n = steps.filter((x) => x.done).length;
    const left = steps.length - n;
    const firstOpen = steps.findIndex((x) => !x.done);
    const line = n === 0 ? d.journeyStart : left === 0 ? d.journeyDone : left === 1 ? d.journeyOne : fmt(d.journeyLeft, { n: left });
    journeyBody.replaceChildren(
      h('div', { class: 'dash-jhead' }, ring(n, steps.length), h('div', null, h('h2', null, d.journey), h('p', null, line))),
      h('ol', { class: 'dash-steps' }, ...steps.map((x, i) => {
        const cls = i === firstOpen ? 'btn btn-primary dash-act' : 'btn btn-outline dash-act';
        const action = x.done
          ? h('span', { class: 'dash-done' }, d.done)
          : x.href ? h('a', { class: cls, href: x.href }, x.act) : h('button', { class: cls, type: 'button', onclick: x.onclick }, x.act);
        return h('li', { class: x.done ? 'done' : '' }, h('span', { class: 'dash-tick', 'aria-hidden': 'true' }, x.done ? svg(ICON.check) : null), h('span', { class: 'dash-step' }, x.label), action);
      })));
  };

  // ---- the visitor's own vote (private) ----
  const voteBody = h('div');
  const voteCard = card('dash-vote', h('p', { class: 'kicker' }, d.yourVote), voteBody);
  const drawVote = () => {
    const c = state.myVote ? candidateById(state.myVote.candidate) : undefined;
    voteBody.replaceChildren(...(c
      ? [h('div', { class: 'dash-cand' }, avatar(c), h('div', { class: 'cand-name' }, h('strong', null, c.name), h('span', { class: 'party' }, c.party))),
        h('p', { class: 'dash-ok' }, svg(ICON.check), d.voteSaved),
        h('a', { class: 'link-btn', href: '#vote' }, d.changeVote, svg(ICON.arrowRight))]
      : [h('p', { class: 'dash-muted' }, d.noVote), h('a', { class: 'btn btn-primary btn-block', href: '#vote' }, svg(ICON.ballot), d.voteNow)]),
    h('p', { class: 'dash-lock' }, svg(ICON.lock), d.votePrivate));
  };

  // ---- priorities ----
  const picksBody = h('div');
  const picksCard = card('dash-picks', cardHead(d.yourPriorities, linkTo('#start', d.change)), picksBody);
  const drawPicks = () => {
    picksBody.replaceChildren(state.picks.length
      ? h('div', { class: 'dash-chips' }, ...state.picks.map((id) => h('span', { class: 'dash-chip' }, svg(PRIORITY_ICONS[id]), priorityLabel(id))))
      : h('div', null, h('p', { class: 'dash-muted' }, d.noPicks), h('a', { class: 'btn btn-outline', href: '#start' }, d.pickNow)));
  };

  // ---- closest candidates by public record ----
  const matchBody = h('div');
  const matchCard = card('dash-matches', cardHead(d.matches, linkTo(state.picks.length ? '#match' : '#candidates', d.seeAll)), h('p', { class: 'dash-sub' }, d.matchesNote), matchBody);
  const drawMatches = () => {
    const picks = state.picks;
    if (!picks.length) { matchBody.replaceChildren(h('p', { class: 'dash-muted' }, d.matchesEmpty), h('a', { class: 'btn btn-outline', href: '#start' }, d.pickNow)); return; }
    const rows = matchCandidates(candidatesShuffled(), picks).ranked.slice(0, 3);
    matchBody.replaceChildren(h('div', { class: 'dash-mlist' }, ...rows.map((m) => {
      const label = fmt(S().match.matchOf, { m: m.matched.length, n: picks.length });
      return h('button', { class: 'dash-mrow', type: 'button', 'aria-haspopup': 'dialog', onclick: () => { markSeenCandidates(); openProfile(m.candidate); } },
        avatar(m.candidate),
        h('span', { class: 'cand-name' }, h('strong', null, m.candidate.name), h('span', { class: 'party' }, m.candidate.party)),
        h('span', { class: 'dash-mscore' }, h('b', { class: 'num' }, label),
          h('span', { class: 'bar', role: 'img', 'aria-label': label }, h('i', { class: m.matched.length ? 'on' : '', style: `width:${(m.matched.length / picks.length) * 100}%` }))));
    })));
  };

  // ---- the two games ----
  const games = h('div', { class: 'dash-games' });
  const drawGames = () => {
    const qs = quizStatus();
    const quizLine = qs.done ? (qs.score === null ? fmt(d.quizDoneNoScore, { d: qs.day }) : fmt(d.quizDone, { d: qs.day, s: qs.score }))
      : qs.answered ? fmt(d.quizProgress, { d: qs.day, a: qs.answered }) : fmt(d.quizNew, { d: qs.day });
    const res = gameResult();
    const lead = res?.top[0];
    games.replaceChildren(
      h('a', { class: 'card dash-game', href: '#quiz' }, well(ICON.idea),
        h('h3', null, hs.quizCard), h('p', null, quizLine),
        h('span', { class: 'btn btn-outline dash-act' }, qs.done ? d.seeResults : qs.answered ? d.keepGoing : d.actPlay)),
      h('a', { class: 'dash-game solid', href: '#president' }, h('span', { class: 'well' }, svg(ICON.palace)),
        h('h3', null, S().pres.title), h('p', null, lead ? fmt(d.gameDone, { p: l(PROFILES[lead].title) }) : d.gameNew),
        h('span', { class: 'btn dash-act on-solid' }, lead ? d.playAgain : d.playNow)));
  };

  // ---- live results (same numbers as the public home) ----
  const liveNum = h('b', { class: 'num' }, '·');
  const liveRows = h('div', { class: 'dash-live' }, ...Array.from({ length: 3 }, () => h('span', { class: 'sk-line' })));
  const liveCard = card('dash-results', cardHead(hs.resultsCard, linkTo('#results', hs.seeAllResults)),
    h('p', { class: 'dash-big' }, liveNum, h('span', null, hs.participants)), liveRows);
  const drawLive = (r: Counts) => {
    liveNum.textContent = fmtNumber(r.total);
    if (r.total === 0) { liveRows.replaceChildren(h('p', { class: 'dash-muted' }, hs.noVotesYet)); return; }
    const ranked = candidatesShuffled().map((c) => ({ c, n: r.counts[c.id] ?? 0 })).sort((a, b) => b.n - a.n).slice(0, 3);
    liveRows.replaceChildren(...ranked.map(({ c, n }) => liveRow(c, pct(n, r.total))));
  };
  const liveRow = (c: Candidate, p: number) => h('button', { class: 'dash-lrow', type: 'button', 'aria-haspopup': 'dialog', onclick: () => openProfile(c) },
    avatar(c), h('span', { class: 'dash-lname' }, c.name), h('b', { class: 'num' }, `${p} %`),
    h('span', { class: 'bar', role: 'img', 'aria-label': `${c.name}: ${p} %` }, h('i', { class: p ? 'on' : '', style: `width:${p}%` })));
  const cached = readTopCache();
  if (cached) drawLive(cached);
  void loadCounts(content().candidates.map((c) => c.id)).then((r) => { if (r && alive) { writeTopCache(r); drawLive(r); } }).catch(() => {});

  // ---- account ----
  const out = h('button', { class: 'btn btn-outline btn-block', type: 'button' }, S().account.signOut);
  out.addEventListener('click', () => {
    out.setAttribute('disabled', '');
    void disconnect().then(() => toast(S().account.disconnected)).catch(() => { out.removeAttribute('disabled'); toast(S().account.errGeneric); });
  });
  const acctCard = card('dash-account', cardHead(d.account),
    account.email ? h('p', { class: 'dash-email' }, account.email) : null,
    h('p', { class: 'dash-muted' }, d.accountNote), out);

  // ---- layout: two columns on desktop; on phones the columns dissolve and `order` sets the sequence ----
  const order = (el: HTMLElement, n: number) => { el.style.setProperty('--o', String(n)); return el; };
  const cols = h('div', { class: 'dash-cols' },
    h('div', { class: 'dash-main' }, order(journey, 1), order(matchCard, 4), order(games, 5)),
    h('div', { class: 'dash-side' }, order(voteCard, 2), order(picksCard, 3), order(liveCard, 6), order(acctCard, 7)));
  main.append(
    h('div', { class: 'wrap dash' }, greet, cols, whyVote()),
    civic.el,
    h('div', { class: 'wrap' }, footer()));

  const drawAll = () => { drawJourney(); drawVote(); drawPicks(); drawMatches(); drawGames(); };
  drawAll();
  cleanups.push(onState(() => { if (alive) drawAll(); }));

  // The vote lives in Firestore for signed-in visitors: fetch it once if this page opened first.
  if (!state.myVote) void getStorage().then((st) => st.getMyVote()).then((v) => { if (v && alive) setMyVote(v); }).catch(() => {});

  return () => { alive = false; for (const f of cleanups) f(); };
}
