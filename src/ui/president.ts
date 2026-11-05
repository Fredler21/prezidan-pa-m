import type { PriorityId } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, l } from '../i18n';
import {
  DECISIONS, GAUGES, PER_TERM, PROFILES, SKIP_EFFECTS, START,
  affordable, applyEffects, deckOf, drawDeck, replay, scoreOf, topPriorities,
  type Effects, type GameChoice, type GameDecision, type GaugeId, type Gauges, type News,
} from '../data/president-game';
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
 * « Si m te prezidan » (Stitch « s12-president » v3): an inauguration card, then eight decisions
 * drawn for this term. The country panel (sticky: a compact strip on phones, a side card on
 * desktop) shows five meters and the progress index; every decision is confirmed, then « Sa k pase »
 * tells what happened while the meters move. Delayed consequences and crises land as news at a
 * later decision, or after the term. The 5 year report gives the score (a ring), the best score,
 * the profile and the candidates whose public record covers the same three priorities (ranked like
 * the match page, never a recommendation). Signed-in players keep their unfinished term and their
 * results on every device; everyone else is invited to sign in to save their progress.
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
    return d ? [h('span', { class: d > 0 ? 'pg-eff up' : 'pg-eff down', style: `--i:${i++}` }, `${signed(d)} ${label(id)}`)] : [];
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

  const panel = h('aside', { class: 'pg-country', 'aria-label': s.country });
  const stage = h('div', { class: 'pg-main' });
  const grid = h('div', { class: 'pg-grid' }, panel, stage);
  const finalEl = h('div');
  const saveSlot = h('div', { class: 'pg-save-slot' });
  main.append(h('div', { class: 'wrap pg-page' },
    h('div', { class: 'pg-head' }, h('p', { class: 'kicker' }, s.kicker), h('h1', null, s.title), h('p', { class: 'lead' }, s.lead)),
    grid, finalEl, saveSlot,
    h('p', { class: 'pg-gamenote' }, svg(ICON.info), s.gameNote),
    whyVote(), footer()));

  // ---- saving: signed-in players keep the unfinished term; everyone else is invited to sign in ----
  const persist = () => {
    if (!getAccount()) return;
    saveGameRun(answers.length < N && ids.length ? { ids, answers } : null);
    saveGameProgress();
  };
  const drawSave = () => {
    saveSlot.replaceChildren(getAccount()
      ? h('p', { class: 'pg-saved' }, svg(ICON.check), s.saveSigned)
      : h('div', { class: 'pg-save' }, h('span', { class: 'pg-save-icon', 'aria-hidden': 'true' }, svg(ICON.lock)),
        h('p', null, h('b', null, s.saveTitle), ` ${s.saveLead}`),
        h('div', { class: 'pg-save-actions' },
          h('button', { class: 'btn btn-outline', type: 'button', onclick: () => openAccountSheet('in') }, S().account.signIn),
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp))));
  };
  drawSave();
  const offAccount = onAccountChange(() => { if (!alive) return; drawSave(); persist(); });
  cleanups.push(() => { offAccount(); });

  // ---- the country panel: meters count and slide from what was shown, changed rows flash ----
  let shown: Gauges | null = null;
  const drawPanel = (g: Gauges, year: number, fromZero = false) => {
    const prev = fromZero ? ZERO : shown;
    shown = { ...g };
    const scoreEl = h('b', { class: 'num' }, String(scoreOf(prev ?? g)));
    const anims: [HTMLElement, HTMLElement, number, number][] = [];
    const rows = GAUGES.map(({ id }) => {
      const v = g[id], was = prev ? prev[id] : v, d = !fromZero && prev ? v - prev[id] : 0;
      const bar = h('i', { style: `width:${was}%` });
      const val = h('span', { class: 'pg-mval num' }, String(was));
      anims.push([bar, val, was, v]);
      const cls = `pg-meter${v < 25 ? ' low' : v >= 60 ? ' high' : ''}${d ? ' flash' : ''}`;
      return h('li', { class: cls, 'aria-label': `${label(id)}: ${v}` },
        h('span', { class: 'pg-mtop', 'aria-hidden': 'true' }, svg(GAUGE_ICON[id]), h('span', { class: 'pg-mlabel' }, label(id)),
          d ? h('span', { class: d > 0 ? 'pg-delta up' : 'pg-delta down' }, signed(d)) : null, val),
        h('span', { class: 'pg-mbar', 'aria-hidden': 'true' }, bar));
    });
    panel.replaceChildren(h('div', { class: 'pg-country-card' },
      h('div', { class: 'pg-chead' },
        h('div', null, h('p', { class: 'pg-kicker' }, s.country), h('small', null, s.index)),
        h('p', { class: 'pg-score' }, scoreEl, h('span', null, '/100'))),
      h('ul', { class: 'pg-meters' }, ...rows),
      h('p', { class: 'pg-year' }, fmt(s.yearOf, { y: year }))));
    if (prev) cleanups.push(tween(scoreEl, scoreOf(prev), scoreOf(g), 800, String));
    anims.forEach(([, val, from, to], k) => { if (from !== to) cleanups.push(tween(val, from, to, 700 + k * 60, String)); });
    requestAnimationFrame(() => { for (const [bar, , , to] of anims) bar.style.width = `${to}%`; });
  };

  const progress = (i: number) => h('div', { class: 'pg-prog', 'aria-hidden': 'true' }, ...Array.from({ length: N }, (_, j) => h('i', { class: j < i ? 'done' : j === i ? 'now' : '' })));
  const focusFirst = (sel: string) => (stage.querySelector(sel) as HTMLElement | null)?.focus({ preventScroll: true });
  // A tall card is replaced by a short one: bring the new card back into view, under the sticky meters on phones.
  const reveal = () => {
    const under = window.matchMedia('(max-width: 1023px)').matches ? panel.getBoundingClientRect().height : 0;
    const top = stage.getBoundingClientRect().top;
    if (top < under || top > window.innerHeight * 0.6) stage.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  };
  const yearPill = (i: number) => h('span', { class: i > 0 && YEAR[i] !== YEAR[i - 1] ? 'pg-yr new' : 'pg-yr' }, fmt(s.year, { y: YEAR[i] ?? 5 }));
  const newsItem = (n: News) => {
    const good = total(n.effects) > 0;
    return h('div', { class: good ? 'pg-news good' : n.crisis ? 'pg-news bad crisis' : 'pg-news bad', role: 'status' }, svg(good ? ICON.check : ICON.info),
      h('div', null, h('p', null, h('b', null, good ? s.goodNews : n.crisis ? s.crisis : s.news), ` · ${l(n.title)}`),
        h('div', { class: 'pg-effs' }, ...changes(START, applyEffects(START, n.effects)))));
  };

  // ---- the inauguration (or a resumed term) ----
  const begin = (fresh: boolean) => {
    if (fresh) { ids = drawDeck(); deck = deckOf(ids) ?? []; answers = []; }
    grid.classList.remove('intro');
    finalEl.replaceChildren();
    grid.hidden = false;
    shown = null;
    persist();
    drawDecide(true);
    reveal();
    focusFirst('.pg-q');
  };
  const drawIntro = (resumable: boolean) => {
    grid.classList.add('intro');
    grid.hidden = false;
    finalEl.replaceChildren();
    const meters = h('ul', { class: 'pg-oath-meters' }, ...GAUGES.map(({ id }, i) =>
      h('li', { style: `--i:${i};--w:${START[id]}%` }, h('span', null, label(id)), h('b', { class: 'num' }, String(START[id])), h('i', { 'aria-hidden': 'true' }))));
    stage.replaceChildren(h('section', { class: 'pg-oath', 'aria-labelledby': 'pg-oath-title' },
      h('span', { class: 'pg-seal', 'aria-hidden': 'true' }, svg(ICON.palace)),
      h('p', { class: 'pg-kicker' }, resumable ? s.resumeKicker : s.oathKicker),
      h('h2', { id: 'pg-oath-title' }, resumable ? s.resumeTitle : s.oathTitle),
      h('p', { class: 'pg-oath-lead' }, resumable ? fmt(s.resumeLead, { i: answers.length + 1, n: N }) : s.oathLead),
      resumable ? null : meters,
      h('p', { class: 'pg-oath-note' }, fmt(s.oathDeck, { k: N, n: DECISIONS.length })),
      h('div', { class: 'pg-oath-actions' },
        h('button', { class: 'btn pg-white', type: 'button', onclick: () => begin(!resumable) }, resumable ? s.resume : s.start, svg(ICON.arrowRight)),
        resumable ? h('button', { class: 'btn pg-ghost', type: 'button', onclick: () => begin(true) }, s.newTerm) : null)));
  };

  // ---- a decision: pick, then confirm (decisions are final) ----
  const drawDecide = (first = false) => {
    const i = answers.length;
    const d = deck[i];
    const turn = replay(deck, answers).turns[i];
    if (!d || !turn) return;
    const g = turn.before;
    drawPanel(g, YEAR[i] ?? 5, first && i === 0);
    let picked: number | null = null;
    const decide = h('button', { class: 'btn btn-primary pg-decide', type: 'button', onclick: () => { if (picked !== null) commit(picked); } }, s.decide, svg(ICON.arrowRight));
    decide.disabled = true;
    const buttons = d.choices.map((ch, k) => {
      const can = affordable(g, ch);
      const money = ch.effects.treasury ?? 0;
      const chip = !can ? h('span', { class: 'pg-cost broke' }, s.broke)
        : money < 0 ? h('span', { class: 'pg-cost' }, fmt(s.cost, { n: -money }))
        : money > 0 ? h('span', { class: 'pg-cost gain' }, fmt(s.gain, { n: money }))
        : h('span', { class: 'pg-cost' }, s.free);
      const b = h('button', { class: 'pg-opt', type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-disabled': can ? undefined : 'true', style: `--i:${k}` },
        well(PRIORITY_ICONS[ch.main]),
        h('span', { class: 'pg-opt-text' }, h('strong', null, l(ch.title)), h('span', null, l(ch.sub)), chip),
        h('span', { class: 'pg-check', 'aria-hidden': 'true' }, svg(ICON.check)));
      if (can) b.addEventListener('click', () => {
        picked = k;
        buttons.forEach((x, j) => x.setAttribute('aria-checked', String(j === k)));
        decide.disabled = false;
        decide.classList.remove('ready'); void decide.offsetWidth; decide.classList.add('ready');
      });
      return b;
    });
    stage.replaceChildren(h('div', { class: 'pg-card enter' },
      h('div', { class: 'pg-top' }, h('span', { class: 'num' }, fmt(s.step, { i: i + 1, n: N })), yearPill(i)),
      progress(i),
      turn.income ? h('p', { class: 'pg-income' }, fmt(s.income, { n: turn.income })) : null,
      ...turn.news.map(newsItem),
      h('div', { class: 'pg-body' },
        h('div', { class: 'pg-scn' },
          h('span', { class: 'pg-icon' }, svg(PRIORITY_ICONS[d.icon])),
          h('div', null, h('h2', { class: 'pg-q', id: 'pg-q', tabindex: -1 }, l(d.prompt)), h('p', { class: 'pg-hint' }, s.hint))),
        h('div', { class: 'pg-opts', role: 'radiogroup', 'aria-labelledby': 'pg-q' }, ...buttons)),
      h('div', { class: 'pg-actions' }, h('button', { class: 'pg-skip', type: 'button', onclick: () => commit(null) }, s.skip), decide)));
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
    stage.replaceChildren(h('div', { class: 'pg-card pg-result', 'aria-live': 'polite' },
      h('div', { class: 'pg-top' }, h('span', { class: 'num' }, fmt(s.step, { i: i + 1, n: N })), yearPill(i)),
      progress(i + 1),
      h('p', { class: 'pg-kicker2' }, s.happened),
      h('h2', null, ch ? l(ch.title) : s.skipTitle),
      h('p', { class: 'pg-outcome' }, ch ? l(ch.outcome) : s.skipOutcome),
      h('div', { class: 'pg-effs' }, ...changes(turn.before, after)),
      ch?.later ? h('p', { class: 'pg-later' }, svg(ICON.calendar), s.laterHint) : null,
      h('button', { class: 'btn btn-primary pg-next', type: 'button', onclick: () => { if (last) { drawFinal(true); } else { drawDecide(); reveal(); focusFirst('.pg-q'); } } },
        last ? s.finish : s.next, svg(ICON.arrowRight))));
    reveal();
    focusFirst('.pg-next');
  };

  const share = async (text: string) => {
    try {
      if (typeof navigator.share === 'function') { await navigator.share({ text, title: S().appName }); return; }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    window.open(whatsappUrl(text), '_blank', 'noopener');
  };

  // ---- the 5 year report ----
  const drawFinal = (fresh: boolean) => {
    const { final, after } = replay(deck, answers);
    const score = scoreOf(final);
    const top = topPriorities(deck, answers);
    const record = fresh ? saveBestScore(score) : false;
    if (fresh) {
      saveGameResult({ ids, answers, top, at: Date.now(), score });
      if (getAccount()) { saveGameRun(null); saveGameProgress(); }
    }
    const best = bestScore();
    const [title, line, tone] = score >= 60 ? [s.g1t, s.g1, 'high'] : score >= 48 ? [s.g2t, s.g2, 'mid'] : score >= 36 ? [s.g3t, s.g3, 'low'] : [s.g4t, s.g4, 'bad'];
    const scoreEl = h('b', { class: 'num' }, fresh ? '0' : String(score));
    const C = 2 * Math.PI * 70;
    const ring = h('div', { class: `pg-ring ${tone}`, role: 'img', 'aria-label': `${score}/100`,
      html: `<svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" class="track"/><circle cx="80" cy="80" r="70" class="arc" style="--c:${C.toFixed(1)};--off:${(C * (1 - score / 100)).toFixed(1)}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - score / 100)).toFixed(1)}" transform="rotate(-90 80 80)"/></svg>` });
    ring.append(h('p', null, scoreEl, h('span', null, '/100')));

    const tiles = h('div', { class: 'pg-ftiles' }, ...GAUGES.map(({ id }, k) => {
      const d = final[id] - START[id];
      return h('div', { class: 'pg-ftile', style: `--i:${k}` },
        h('p', { class: 't' }, svg(GAUGE_ICON[id]), label(id)),
        h('p', { class: 'v' }, h('b', { class: 'num' }, String(final[id])), h('em', { class: d > 0 ? 'up' : d < 0 ? 'down' : 'flat' }, d ? signed(d) : '0')),
        h('small', { class: 'num' }, `${s.before}: ${START[id]} · ${s.after}: ${final[id]}`));
    }));
    const afterEl = after.length ? h('div', { class: 'pg-after' }, h('h3', { class: 'pg-h3' }, s.afterTerm), ...after.map((n) =>
      h('div', { class: total(n.effects) > 0 ? 'pg-after-row good' : 'pg-after-row' }, h('p', null, l(n.title)), h('div', { class: 'pg-effs' }, ...changes(START, applyEffects(START, n.effects)))))) : null;

    const lead = top[0];
    let profileEl: HTMLElement | null = null;
    let saveBtn: HTMLElement | null = null;
    if (lead) {
      const { ranked } = matchCandidates(candidatesShuffled(), top);
      const rows = ranked.filter((m) => m.matched.length > 0).slice(0, MATCH_ROWS);
      const chip = (id: PriorityId) => h('span', { class: 'pg-chip' }, svg(PRIORITY_ICONS[id]), priorityLabel(id));
      profileEl = h('div', { class: 'pg-fprof' },
        h('p', { class: 'pg-kicker' }, s.profileKicker),
        h('div', { class: 'pg-prof' }, h('span', { class: 'pg-prof-icon' }, svg(PRIORITY_ICONS[lead])),
          h('div', null, h('h3', null, l(PROFILES[lead].title)), h('p', null, l(PROFILES[lead].line)))),
        h('div', { class: 'pg-chips' }, ...top.map(chip)),
        h('hr', { class: 'pg-hr' }),
        h('h3', { class: 'pg-h3' }, s.matchTitle),
        rows.length
          ? h('div', { class: 'pg-cands' }, ...rows.map((m) => h('button', { class: 'pg-cand', type: 'button', 'aria-haspopup': 'dialog', onclick: () => { markSeenCandidates(); openProfile(m.candidate); } },
            avatar(m.candidate), h('span', { class: 'pg-cand-name' }, h('strong', null, m.candidate.name), h('small', null, m.candidate.party)),
            h('b', { class: 'num' }, fmt(s.matchOf, { m: m.matched.length, n: top.length })))))
          : h('p', { class: 'pg-none' }, s.noMatch),
        h('p', { class: 'pg-note' }, svg(ICON.info), s.note));
      const seeMatch = () => h('a', { class: 'btn pg-ghost', href: '#match' }, s.seeMatch, svg(ICON.arrowRight));
      const already = top.length === state.picks.length && top.every((p) => state.picks.includes(p));
      const btn: HTMLElement = already ? seeMatch() : h('button', { class: 'btn pg-ghost', type: 'button' }, svg(ICON.check), s.save);
      if (!already) btn.addEventListener('click', () => { setPicks(top); toast(s.saved); btn.replaceWith(seeMatch()); });
      saveBtn = btn;
    }
    const shareText = fmt(s.shareText, { s: score, p: lead ? l(PROFILES[lead].title) : '', url: `${SITE_URL}/#president` });

    const recap = h('details', { class: 'pg-recap-d' }, h('summary', null, s.recap),
      h('ol', { class: 'pg-recap' }, ...deck.map((d, i) => {
        const a = answers[i];
        const ch = a === null || a === undefined ? undefined : d.choices[a];
        return h('li', { class: ch ? '' : 'skipped' }, ch ? well(PRIORITY_ICONS[ch.main]) : well(ICON.arrowRight),
          h('div', null, h('small', null, l(d.prompt)), h('strong', null, ch ? l(ch.title) : s.skipped)));
      })));

    const report = h('section', { class: 'pg-final', 'aria-labelledby': 'pg-final-title' },
      h('div', { class: 'pg-fhead' },
        h('div', { class: 'pg-ftitle' }, h('p', { class: 'pg-kicker' }, s.report), h('h2', { id: 'pg-final-title', tabindex: -1 }, title), h('p', null, line),
          record && best !== null ? h('span', { class: 'pg-record' }, s.newBest) : best !== null ? h('p', { class: 'pg-best' }, fmt(s.best, { n: best })) : null),
        ring),
      tiles,
      afterEl,
      profileEl,
      h('div', { class: 'pg-factions' },
        h('button', { class: 'btn pg-white', type: 'button', onclick: () => { begin(true); } }, svg(ICON.refresh), s.again),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => void share(shareText) }, svg(ICON.share), s.share),
        saveBtn),
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
