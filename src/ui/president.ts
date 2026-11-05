import type { PriorityId } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, fmtDate, l } from '../i18n';
import {
  DECISIONS, GAUGES, PER_TERM, PROFILES, SKIP_EFFECTS, START,
  affordable, applyEffects, deckOf, drawDeck, replay, scoreOf, topPriorities,
  type Effects, type GameChoice, type GameDecision, type GaugeId, type Gauges, type News,
} from '../data/president-game';
import { FIRST_ROUND } from '../data/dates';
import { bestScore, gameResult, gameRun, markSeenCandidates, saveBestScore, saveGameResult, saveGameRun } from '../lib/progress';
import { matchCandidates, whatsappUrl } from '../lib/util';
import { confetti } from '../lib/confetti';
import { candidatesShuffled } from '../content';
import { state, setPicks } from '../state';
import { getAccount, onAccountChange, saveGameProgress } from '../account';
import { SITE_URL } from '../data/site';
import { avatar, footer, priorityLabel, well } from './common';
import { openProfile } from './profile';
import { openAccountSheet } from './account';
import { whyVote } from './why-vote';
import { toast } from './toast';
import { tween } from './home';

/*
 * « Si m te prezidan » (Stitch « s17-pres-intro », « s17-pres-decision », « s17-pres-report », phone and desktop):
 * the main subject of the site. A white page; the dark « Eta peyi a » panel is the only dark element while
 * playing (a side card on desktop, a compact sticky strip on phones). The inauguration, then eight decisions
 * drawn for this term: pick, confirm, « Sa k pase » while the meters move. Delayed consequences and crises
 * land as news at a later decision, or after the term. The 5 year report gives the score ring, the five
 * results, the profile and the candidates whose public record covers the same three priorities (never a
 * recommendation), and ends on the real vote. Signed-in players keep their unfinished term on every device.
 */

const N = PER_TERM;
const YEAR = [1, 1, 2, 2, 3, 4, 4, 5];
const MATCH_ROWS = 3;
const GAUGE_ICON: Record<GaugeId, string> = { security: PRIORITY_ICONS.security, economy: PRIORITY_ICONS.economy, social: PRIORITY_ICONS.education, trust: ICON.people, treasury: ICON.palace };
const ZERO: Gauges = { security: 0, economy: 0, social: 0, trust: 0, treasury: 0 };
const label = (id: GaugeId) => l(GAUGES.find((x) => x.id === id)?.label);
const signed = (n: number) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
const total = (e: Effects) => Object.values(e).reduce((a, b) => a + (b ?? 0), 0);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Chips for what actually changed between two states (clamping included), in meter order, popping in turn. */
function changes(before: Gauges, after: Gauges): HTMLElement[] {
  let i = 0;
  return GAUGES.flatMap(({ id }) => {
    const d = after[id] - before[id];
    return d ? [h('span', { class: d > 0 ? 'gx-eff up' : 'gx-eff down', style: `--i:${i++}` }, `${signed(d)} ${label(id)}`)] : [];
  });
}

export function renderPresident(main: HTMLElement): () => void {
  clear(main);
  const s = S().pres;
  let ids: string[] = [];
  let deck: GameDecision[] = [];
  let answers: (number | null)[] = [];
  let alive = true;
  const cleanups: (() => void)[] = [];

  const panel = h('aside', { class: 'gx-country', 'aria-label': s.country });
  const stage = h('div', { class: 'gx-main' });
  const grid = h('div', { class: 'gx-grid' }, panel, stage);
  const finalEl = h('div');
  const saveSlot = h('div', { class: 'gx-save-slot' });
  main.append(h('div', { class: 'wrap gx-page' },
    h('header', { class: 'gx-head' }, h('p', { class: 'gx-badge' }, svg(ICON.palace), s.badge), h('h1', null, s.title), h('p', { class: 'gx-lead' }, s.lead)),
    grid, finalEl, saveSlot,
    h('p', { class: 'gx-gamenote' }, svg(ICON.info), s.gameNote),
    whyVote(), footer()));

  // ---- saving: signed-in players keep the unfinished term; everyone else is invited to sign in ----
  const persist = () => {
    if (!getAccount()) return;
    saveGameRun(answers.length < N && ids.length ? { ids, answers } : null);
    saveGameProgress();
  };
  const drawSave = () => {
    saveSlot.replaceChildren(getAccount()
      ? h('p', { class: 'gx-saved' }, svg(ICON.check), s.saveSigned)
      : h('div', { class: 'gx-save' }, h('span', { class: 'gx-save-icon', 'aria-hidden': 'true' }, svg(ICON.lock)),
        h('p', null, h('b', null, s.saveTitle), ` ${s.saveLead}`),
        h('div', { class: 'gx-save-actions' },
          h('button', { class: 'btn gx-btn gx-line', type: 'button', onclick: () => openAccountSheet('in') }, S().account.signIn),
          h('button', { class: 'btn btn-primary gx-btn', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp))));
  };
  drawSave();
  const offAccount = onAccountChange(() => { if (!alive) return; drawSave(); persist(); });
  cleanups.push(() => { offAccount(); });

  // ---- the country panel: meters count and slide from what was shown, changed rows flash ----
  let shown: Gauges | null = null;
  const drawPanel = (g: Gauges, year: number, fromZero = false, foot: string | null = null) => {
    const prev = fromZero ? ZERO : shown;
    shown = { ...g };
    const scoreEl = h('b', { class: 'num' }, String(scoreOf(prev ?? g)));
    const anims: [HTMLElement, HTMLElement, number, number][] = [];
    const rows = GAUGES.map(({ id }) => {
      const v = g[id], was = prev ? prev[id] : v, d = !fromZero && prev ? v - prev[id] : 0;
      const bar = h('i', { style: `width:${was}%` });
      const val = h('span', { class: 'gx-mval num' }, String(was));
      anims.push([bar, val, was, v]);
      const cls = `gx-meter${v < 25 ? ' low' : v >= 60 ? ' high' : ''}${d ? ' flash' : ''}`;
      return h('li', { class: cls, 'aria-label': `${label(id)}: ${v}` },
        h('span', { class: 'gx-mtop', 'aria-hidden': 'true' }, svg(GAUGE_ICON[id]), h('span', { class: 'gx-mlabel' }, label(id)),
          d ? h('span', { class: d > 0 ? 'gx-delta up' : 'gx-delta down' }, signed(d)) : null, val),
        h('span', { class: 'gx-mbar', 'aria-hidden': 'true' }, bar));
    });
    panel.replaceChildren(h('div', { class: 'gx-panel' },
      h('div', { class: 'gx-ptop' }, h('p', null, h('i', { class: 'gx-dot', 'aria-hidden': 'true' }), s.country), h('span', { class: 'gx-pyear' }, fmt(s.yearOf, { y: year }))),
      h('div', { class: 'gx-index' }, h('p', null, s.index), h('p', { class: 'gx-score' }, scoreEl, h('span', null, '/100'))),
      h('ul', { class: 'gx-meters' }, ...rows),
      foot ? h('p', { class: 'gx-pfoot' }, foot) : null));
    if (prev) cleanups.push(tween(scoreEl, scoreOf(prev), scoreOf(g), 800, String));
    anims.forEach(([, val, from, to], k) => { if (from !== to) cleanups.push(tween(val, from, to, 700 + k * 60, String)); });
    requestAnimationFrame(() => { for (const [bar, , , to] of anims) bar.style.width = `${to}%`; });
  };

  const progress = (i: number) => h('div', { class: 'gx-prog', 'aria-hidden': 'true' }, ...Array.from({ length: N }, (_, j) => h('i', { class: j < i ? 'done' : j === i ? 'now' : '' })));
  const top = (i: number) => h('div', { class: 'gx-top' }, h('span', { class: 'gx-step num' }, fmt(s.step, { i: i + 1, n: N })),
    h('span', { class: i > 0 && YEAR[i] !== YEAR[i - 1] ? 'gx-yr new' : 'gx-yr' }, fmt(s.year, { y: YEAR[i] ?? 5 })));
  const focusFirst = (sel: string) => (stage.querySelector(sel) as HTMLElement | null)?.focus({ preventScroll: true });
  // A tall card is replaced by a short one: bring the new card back into view, under the sticky strip on phones.
  const reveal = () => {
    const under = window.matchMedia('(max-width: 1023px)').matches ? panel.getBoundingClientRect().height : 0;
    const t = stage.getBoundingClientRect().top;
    if (t < under || t > window.innerHeight * 0.6) stage.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  };
  const newsItem = (n: News) => {
    const good = total(n.effects) > 0;
    return h('div', { class: `gx-news ${good ? 'good' : 'bad'}${n.crisis ? ' crisis' : ''}`, role: 'status' },
      h('p', null, h('b', null, good ? s.goodNews : n.crisis ? s.crisis : s.news), ` · ${l(n.title)}`),
      h('div', { class: 'gx-effs' }, ...changes(START, applyEffects(START, n.effects))));
  };

  // ---- the inauguration (or a resumed term) ----
  const begin = (fresh: boolean) => {
    if (fresh) { ids = drawDeck(); deck = deckOf(ids) ?? []; answers = []; }
    finalEl.replaceChildren();
    grid.hidden = false;
    shown = null;
    persist();
    drawDecide(true);
    reveal();
    focusFirst('.gx-q');
  };
  const drawIntro = (resumable: boolean) => {
    grid.hidden = false;
    finalEl.replaceChildren();
    const best = bestScore();
    const now = resumable ? replay(deck, answers).turns[answers.length]?.before ?? START : START;
    shown = null;
    drawPanel(now, resumable ? YEAR[answers.length] ?? 1 : 1, true, best !== null ? fmt(s.best, { n: best }) : null);
    stage.replaceChildren(h('section', { class: 'gx-card gx-oath enter', 'aria-labelledby': 'gx-oath-title' },
      h('span', { class: 'gx-seal', 'aria-hidden': 'true' }, svg(ICON.palace)),
      h('p', { class: 'gx-kicker' }, resumable ? s.resumeKicker : s.oathKicker),
      h('h2', { id: 'gx-oath-title' }, resumable ? s.resumeTitle : s.oathTitle),
      h('p', { class: 'gx-sub' }, resumable ? fmt(s.resumeLead, { i: answers.length + 1, n: N }) : s.oathLead),
      resumable ? null : h('ul', { class: 'gx-points' }, ...[fmt(s.oathDeck, { k: N, n: DECISIONS.length }), s.hint, s.oathLater].map((t) => h('li', null, svg(ICON.check), t))),
      h('div', { class: 'gx-actions' },
        h('button', { class: 'btn btn-primary gx-btn gx-start', type: 'button', onclick: () => begin(!resumable) }, resumable ? s.resume : s.start, svg(ICON.arrowRight)),
        resumable ? h('button', { class: 'btn gx-btn gx-line', type: 'button', onclick: () => begin(true) }, s.newTerm) : null),
      getAccount() ? null : h('p', { class: 'gx-lock' }, svg(ICON.lock), s.saveHint)));
  };

  // ---- a decision: pick, then confirm (decisions are final) ----
  const drawDecide = (first = false) => {
    const i = answers.length;
    const d = deck[i];
    const turn = replay(deck, answers).turns[i];
    if (!d || !turn) return;
    const g = turn.before;
    drawPanel(g, YEAR[i] ?? 5, first && i === 0, turn.income ? fmt(s.income, { n: turn.income }) : null);
    let picked: number | null = null;
    const decide = h('button', { class: 'btn btn-primary gx-btn gx-decide', type: 'button', onclick: () => { if (picked !== null) commit(picked); } }, s.decide, svg(ICON.arrowRight));
    decide.disabled = true;
    const buttons = d.choices.map((ch, k) => {
      const can = affordable(g, ch);
      const money = ch.effects.treasury ?? 0;
      const chip = !can ? h('span', { class: 'gx-cost broke' }, s.broke)
        : money < 0 ? h('span', { class: 'gx-cost' }, fmt(s.cost, { n: -money }))
        : money > 0 ? h('span', { class: 'gx-cost gain' }, fmt(s.gain, { n: money }))
        : h('span', { class: 'gx-cost' }, s.free);
      const b = h('button', { class: 'gx-opt', type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-disabled': can ? undefined : 'true', style: `--i:${k}` },
        h('span', { class: 'gx-opt-top' }, well(PRIORITY_ICONS[ch.main]), chip, h('span', { class: 'gx-check', 'aria-hidden': 'true' }, svg(ICON.check))),
        h('strong', null, l(ch.title)), h('span', { class: 'gx-opt-sub' }, l(ch.sub)));
      if (can) b.addEventListener('click', () => {
        picked = k;
        buttons.forEach((x, j) => x.setAttribute('aria-checked', String(j === k)));
        decide.disabled = false;
        decide.classList.remove('ready'); void decide.offsetWidth; decide.classList.add('ready');
      });
      return b;
    });
    stage.replaceChildren(h('div', { class: 'gx-card gx-decision enter' },
      top(i), progress(i),
      ...turn.news.map(newsItem),
      h('div', { class: 'gx-scn' },
        h('span', { class: 'gx-scn-icon', 'aria-hidden': 'true' }, svg(PRIORITY_ICONS[d.icon])),
        h('div', null, h('h2', { class: 'gx-q', id: 'gx-q', tabindex: -1 }, l(d.prompt)), h('p', { class: 'gx-hint' }, s.hint))),
      h('div', { class: 'gx-opts', role: 'radiogroup', 'aria-labelledby': 'gx-q' }, ...buttons),
      h('div', { class: 'gx-bar' }, h('button', { class: 'gx-skip', type: 'button', onclick: () => commit(null) }, s.skip), decide)));
  };

  // ---- what happened: the outcome, the real changes, and a hint when something comes back later ----
  const commit = (k: number | null) => {
    const i = answers.length;
    const turn = replay(deck, answers).turns[i];
    const ch: GameChoice | undefined = k === null ? undefined : deck[i]?.choices[k];
    if (!turn) return;
    const after = applyEffects(turn.before, ch ? ch.effects : SKIP_EFFECTS);
    answers = [...answers, k];
    persist();
    drawPanel(after, YEAR[i] ?? 5);
    const last = answers.length === N;
    stage.replaceChildren(h('div', { class: 'gx-card gx-result enter', 'aria-live': 'polite' },
      top(i), progress(i + 1),
      h('p', { class: 'gx-kicker' }, s.happened),
      h('h2', null, ch ? l(ch.title) : s.skipTitle),
      h('p', { class: 'gx-outcome' }, ch ? l(ch.outcome) : s.skipOutcome),
      h('div', { class: 'gx-effs' }, ...changes(turn.before, after)),
      ch?.later ? h('p', { class: 'gx-later' }, svg(ICON.calendar), s.laterHint) : null,
      h('div', { class: 'gx-bar end' },
        h('button', { class: 'btn btn-primary gx-btn gx-next', type: 'button', onclick: () => { if (last) { drawFinal(true); } else { drawDecide(); reveal(); focusFirst('.gx-q'); } } },
          last ? s.finish : s.next, svg(ICON.arrowRight)))));
    reveal();
    focusFirst('.gx-next');
  };

  const share = async (text: string) => {
    try {
      if (typeof navigator.share === 'function') { await navigator.share({ text, title: S().appName }); return; }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    window.open(whatsappUrl(text), '_blank', 'noopener');
  };

  // ---- the 5 year report, ending on the real vote ----
  const drawFinal = (fresh: boolean) => {
    const { final, after } = replay(deck, answers);
    const score = scoreOf(final);
    const prios = topPriorities(deck, answers);
    const record = fresh ? saveBestScore(score) : false;
    if (fresh) {
      saveGameResult({ ids, answers, top: prios, at: Date.now(), score });
      if (getAccount()) { saveGameRun(null); saveGameProgress(); }
    }
    const best = bestScore();
    const [title, line] = score >= 60 ? [s.g1t, s.g1] : score >= 48 ? [s.g2t, s.g2] : score >= 36 ? [s.g3t, s.g3] : [s.g4t, s.g4];
    const scoreEl = h('b', { class: 'num' }, fresh ? '0' : String(score));
    const C = 2 * Math.PI * 70;
    const ring = h('div', { class: 'gx-ring', role: 'img', 'aria-label': `${score}/100`,
      html: `<svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" class="track"/><circle cx="80" cy="80" r="70" class="arc" style="--c:${C.toFixed(1)};--off:${(C * (1 - score / 100)).toFixed(1)}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - score / 100)).toFixed(1)}" transform="rotate(-90 80 80)"/></svg>` });
    ring.append(h('p', null, scoreEl, h('span', null, '/100')));

    const tiles = h('div', { class: 'gx-ftiles' }, ...GAUGES.map(({ id }, k) => {
      const d = final[id] - START[id];
      return h('div', { class: 'gx-ftile', style: `--i:${k}` },
        h('p', { class: 'gx-ftile-top' }, well(GAUGE_ICON[id]), h('em', { class: d > 0 ? 'up' : d < 0 ? 'down' : 'flat' }, d ? signed(d) : '0')),
        h('p', { class: 't' }, label(id)),
        h('b', { class: 'num' }, String(final[id])),
        h('small', { class: 'num' }, `${s.before}: ${START[id]} · ${s.after}: ${final[id]}`));
    }));
    const afterEl = after.length ? h('div', { class: 'gx-after' }, h('h3', { class: 'gx-h3' }, s.afterTerm), ...after.map((n) =>
      h('div', { class: total(n.effects) > 0 ? 'gx-after-row good' : 'gx-after-row' }, h('p', null, l(n.title)), h('div', { class: 'gx-effs' }, ...changes(START, applyEffects(START, n.effects)))))) : null;

    const lead = prios[0];
    let profileEl: HTMLElement | null = null;
    let saveBtn: HTMLElement | null = null;
    if (lead) {
      const { ranked } = matchCandidates(candidatesShuffled(), prios);
      const rows = ranked.filter((m) => m.matched.length > 0).slice(0, MATCH_ROWS);
      const chip = (id: PriorityId) => h('span', { class: 'gx-chip' }, svg(PRIORITY_ICONS[id]), priorityLabel(id));
      profileEl = h('div', { class: 'gx-card gx-prof' },
        h('div', { class: 'gx-prof-head' },
          h('span', { class: 'gx-prof-icon', 'aria-hidden': 'true' }, svg(PRIORITY_ICONS[lead])),
          h('div', null, h('p', { class: 'gx-kicker' }, s.profileKicker), h('h3', null, l(PROFILES[lead].title)), h('p', null, l(PROFILES[lead].line))),
          h('div', { class: 'gx-chips' }, ...prios.map(chip))),
        h('h3', { class: 'gx-h3' }, s.matchTitle),
        rows.length
          ? h('div', { class: 'gx-cands' }, ...rows.map((m) => h('button', { class: 'gx-cand', type: 'button', 'aria-haspopup': 'dialog', onclick: () => { markSeenCandidates(); openProfile(m.candidate); } },
            avatar(m.candidate), h('span', { class: 'gx-cand-name' }, h('strong', null, m.candidate.name), h('span', { class: 'party' }, m.candidate.party)),
            h('b', { class: 'gx-match num' }, fmt(s.matchOf, { m: m.matched.length, n: prios.length })), svg(ICON.chevronRight, 'ico gx-chev'))))
          : h('p', { class: 'gx-none' }, s.noMatch),
        h('p', { class: 'gx-note' }, svg(ICON.info), s.note));
      const seeMatch = () => h('a', { class: 'btn gx-btn gx-line', href: '#match' }, s.seeMatch, svg(ICON.arrowRight));
      const already = prios.length === state.picks.length && prios.every((p) => state.picks.includes(p));
      const btn: HTMLElement = already ? seeMatch() : h('button', { class: 'btn gx-btn gx-line', type: 'button' }, svg(ICON.check), s.save);
      if (!already) btn.addEventListener('click', () => { setPicks(prios); toast(s.saved); btn.replaceWith(seeMatch()); });
      saveBtn = btn;
    }
    const shareText = fmt(s.shareText, { s: score, p: lead ? l(PROFILES[lead].title) : '', url: `${SITE_URL}/#president` });

    const recap = h('details', { class: 'gx-recap' }, h('summary', null, svg(ICON.bars), s.recap),
      h('ol', null, ...deck.map((d, i) => {
        const a = answers[i];
        const ch = a === null || a === undefined ? undefined : d.choices[a];
        return h('li', { class: ch ? '' : 'skipped' }, ch ? well(PRIORITY_ICONS[ch.main]) : well(ICON.arrowRight),
          h('div', null, h('small', null, l(d.prompt)), h('strong', null, ch ? l(ch.title) : s.skipped)));
      })));

    const bridge = h('section', { class: 'gx-bridge', 'aria-labelledby': 'gx-bridge-title' },
      h('p', { class: 'gx-bk' }, svg(ICON.ballot), s.bridgeKicker),
      h('h3', { id: 'gx-bridge-title' }, s.bridgeTitle),
      h('p', null, fmt(s.bridgeText, { d: fmtDate(FIRST_ROUND) })),
      h('div', { class: 'gx-actions center' },
        h('a', { class: 'btn gx-btn gx-white', href: '#vote' }, svg(ICON.ballot), s.bridgeVote),
        h('a', { class: 'btn gx-btn gx-ghost', href: state.picks.length ? '#match' : '#candidates' }, s.bridgeCompare, svg(ICON.arrowRight))));

    const report = h('section', { class: 'gx-final', 'aria-labelledby': 'gx-final-title' },
      h('div', { class: 'gx-card gx-fhero' },
        h('div', { class: 'gx-ftext' },
          h('p', { class: 'gx-pill' }, svg(ICON.check), s.report),
          h('h2', { id: 'gx-final-title', tabindex: -1 }, title),
          h('p', { class: 'gx-sub' }, line),
          h('div', { class: 'gx-fmeta' },
            record && best !== null ? h('span', { class: 'gx-record' }, svg(ICON.flame), s.newBest) : null,
            best !== null ? h('span', { class: 'num' }, fmt(s.best, { n: best })) : null)),
        ring),
      tiles,
      afterEl,
      profileEl,
      h('div', { class: 'gx-factions' },
        h('button', { class: 'btn gx-btn gx-line gx-again', type: 'button', onclick: () => { begin(true); } }, svg(ICON.refresh), s.again),
        h('button', { class: 'btn btn-primary gx-btn', type: 'button', onclick: () => void share(shareText) }, svg(ICON.share), s.share),
        saveBtn),
      bridge,
      recap);
    grid.hidden = true;
    finalEl.replaceChildren(report);
    if (fresh) {
      cleanups.push(tween(scoreEl, 0, score, 1400, String));
      report.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      (report.querySelector('h2') as HTMLElement | null)?.focus({ preventScroll: true });
      if (record || score >= 60) window.setTimeout(() => { if (alive) confetti(report); }, 900);
    }
  };

  // ---- where to start: a signed-in player's unfinished term, the last report, or the inauguration ----
  const run = getAccount() ? gameRun() : null;
  const runDeck = run ? deckOf(run.ids) : null;
  const last = gameResult();
  const lastDeck = last?.ids ? deckOf(last.ids) : null;
  if (run && runDeck && run.answers.length < N) { ids = run.ids; deck = runDeck; answers = run.answers.slice(); drawIntro(true); }
  else if (last && lastDeck && last.answers.length === N) { ids = last.ids ?? []; deck = lastDeck; answers = last.answers.slice(); drawFinal(false); }
  else drawIntro(false);
  return () => { alive = false; for (const f of cleanups) f(); };
}
