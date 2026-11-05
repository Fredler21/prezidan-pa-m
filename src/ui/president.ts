import type { PriorityId } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, l } from '../i18n';
import { DECISIONS, GAUGES, PROFILES, SKIP_EFFECTS, START, affordable, applyEffects, replay, scoreOf, topPriorities, type GameChoice, type GaugeId } from '../data/president-game';
import { bestScore, gameResult, markSeenCandidates, saveBestScore, saveGameResult } from '../lib/progress';
import { matchCandidates, whatsappUrl } from '../lib/util';
import { confetti } from '../lib/confetti';
import { candidatesShuffled } from '../content';
import { state, setPicks } from '../state';
import { SITE_URL } from '../data/site';
import { avatar, footer, priorityLabel, well } from './common';
import { openProfile } from './profile';
import { whyVote } from './why-vote';
import { toast } from './toast';
import { tween } from './home';

/*
 * « Si m te prezidan » (Stitch « s12-president » v2): a five year term in eight decisions. The
 * country panel (sticky: a compact strip on phones, a side card on desktop) shows five meters and
 * the progress index; every decision is confirmed, then « Sa k pase » tells what happened while the
 * meters move. Delayed consequences land as news at a later decision. The 5 year report gives the
 * score, the best score, the profile and the candidates whose public record covers the same three
 * priorities (ranked like the match page, never a recommendation). Everything stays on the device.
 */

const N = DECISIONS.length;
const YEAR = [1, 1, 2, 2, 3, 4, 4, 5];
const MATCH_ROWS = 3;
type Gauges = Record<GaugeId, number>;
const GAUGE_ICON: Record<GaugeId, string> = { security: PRIORITY_ICONS.security, economy: PRIORITY_ICONS.economy, social: PRIORITY_ICONS.education, trust: ICON.people, treasury: ICON.palace };
const label = (id: GaugeId) => l(GAUGES.find((x) => x.id === id)?.label);
const signed = (n: number) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Chips for what actually changed between two states (clamping included), in meter order. */
function changes(before: Gauges, after: Gauges): HTMLElement[] {
  return GAUGES.flatMap(({ id }) => {
    const d = after[id] - before[id];
    return d ? [h('span', { class: d > 0 ? 'pg-eff up' : 'pg-eff down' }, `${signed(d)} ${label(id)}`)] : [];
  });
}

export function renderPresident(main: HTMLElement): () => void {
  clear(main);
  const s = S().pres;
  const saved = gameResult();
  let answers: (number | null)[] = saved && saved.answers.length === N ? saved.answers.slice() : [];
  let alive = true;
  const cleanups: (() => void)[] = [];

  const panel = h('aside', { class: 'pg-country', 'aria-label': s.country });
  const stage = h('div', { class: 'pg-main' });
  const grid = h('div', { class: 'pg-grid' }, panel, stage);
  const finalEl = h('div');
  main.append(h('div', { class: 'wrap pg-page' },
    h('div', { class: 'pg-head' }, h('p', { class: 'kicker' }, s.kicker), h('h1', null, s.title), h('p', { class: 'lead' }, s.lead)),
    grid, finalEl,
    h('p', { class: 'pg-gamenote' }, svg(ICON.info), s.gameNote),
    whyVote(), footer()));

  // ---- the country panel: the meters move from what was shown to the new state ----
  let shown: Gauges | null = null;
  const drawPanel = (g: Gauges, year: number) => {
    const prev = shown;
    shown = { ...g };
    const scoreEl = h('b', { class: 'num' }, String(scoreOf(prev ?? g)));
    const bars: [HTMLElement, number][] = [];
    const rows = GAUGES.map(({ id }) => {
      const v = g[id], d = prev ? v - prev[id] : 0;
      const bar = h('i', { style: `width:${prev ? prev[id] : v}%` });
      bars.push([bar, v]);
      return h('li', { class: v < 25 ? 'pg-meter low' : v >= 60 ? 'pg-meter high' : 'pg-meter', 'aria-label': `${label(id)}: ${v}` },
        h('span', { class: 'pg-mtop', 'aria-hidden': 'true' }, svg(GAUGE_ICON[id]), h('span', { class: 'pg-mlabel' }, label(id)),
          d ? h('span', { class: d > 0 ? 'pg-delta up' : 'pg-delta down' }, signed(d)) : null, h('span', { class: 'pg-mval num' }, String(v))),
        h('span', { class: 'pg-mbar', 'aria-hidden': 'true' }, bar));
    });
    panel.replaceChildren(h('div', { class: 'pg-country-card' },
      h('div', { class: 'pg-chead' },
        h('div', null, h('p', { class: 'pg-kicker' }, s.country), h('small', null, s.index)),
        h('p', { class: 'pg-score' }, scoreEl, h('span', null, '/100'))),
      h('ul', { class: 'pg-meters' }, ...rows),
      h('p', { class: 'pg-year' }, fmt(s.yearOf, { y: year }))));
    if (prev) cleanups.push(tween(scoreEl, scoreOf(prev), scoreOf(g), 800, String));
    requestAnimationFrame(() => { for (const [bar, v] of bars) bar.style.width = `${v}%`; });
  };

  const progress = (i: number) => h('div', { class: 'pg-prog', 'aria-hidden': 'true' }, ...DECISIONS.map((_, j) => h('i', { class: j < i ? 'done' : j === i ? 'now' : '' })));
  const focusFirst = (sel: string) => (stage.querySelector(sel) as HTMLElement | null)?.focus({ preventScroll: true });
  // A tall decision card is replaced by a short one: bring the new card back into view, under the sticky meters on phones.
  const reveal = () => {
    const under = window.matchMedia('(max-width: 1023px)').matches ? panel.getBoundingClientRect().height : 0;
    const top = stage.getBoundingClientRect().top;
    if (top < under || top > window.innerHeight * 0.6) stage.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  };

  // ---- a decision: pick, then confirm (decisions are final) ----
  const drawDecide = () => {
    const i = answers.length;
    const d = DECISIONS[i];
    const turn = replay(answers).turns[i];
    if (!d || !turn) return;
    const g = turn.before;
    drawPanel(g, YEAR[i] ?? 5);
    let picked: number | null = null;
    const decide = h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { if (picked !== null) commit(picked); } }, s.decide, svg(ICON.arrowRight));
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
      });
      return b;
    });
    stage.replaceChildren(h('div', { class: 'pg-card' },
      h('div', { class: 'pg-top' }, h('span', { class: 'num' }, fmt(s.step, { i: i + 1, n: N })), h('span', { class: 'pg-yr' }, fmt(s.year, { y: YEAR[i] ?? 5 }))),
      progress(i),
      turn.income ? h('p', { class: 'pg-income' }, fmt(s.income, { n: turn.income })) : null,
      ...turn.news.map((n) => h('div', { class: 'pg-news', role: 'status' }, svg(ICON.info),
        h('div', null, h('p', null, h('b', null, s.news), ` · ${l(n.title)}`), h('div', { class: 'pg-effs' }, ...changes(applyEffects(START, {}), applyEffects(START, n.effects)))))),
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
    const turn = replay(answers).turns[i];
    const ch: GameChoice | undefined = k === null ? undefined : DECISIONS[i]?.choices[k];
    if (!turn) return;
    const after = applyEffects(turn.before, ch ? ch.effects : SKIP_EFFECTS);
    answers = [...answers, k];
    drawPanel(after, YEAR[i] ?? 5);
    const last = answers.length === N;
    stage.replaceChildren(h('div', { class: 'pg-card pg-result', 'aria-live': 'polite' },
      h('div', { class: 'pg-top' }, h('span', { class: 'num' }, fmt(s.step, { i: i + 1, n: N })), h('span', { class: 'pg-yr' }, fmt(s.year, { y: YEAR[i] ?? 5 }))),
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
  const again = () => {
    answers = []; shown = null;
    grid.hidden = false; finalEl.replaceChildren();
    drawDecide();
    grid.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    focusFirst('.pg-q');
  };

  // ---- the 5 year report ----
  const drawFinal = (fresh: boolean) => {
    const { final } = replay(answers);
    const score = scoreOf(final);
    const top = topPriorities(answers);
    const record = fresh ? saveBestScore(score) : false;
    if (fresh) saveGameResult({ answers, top, at: Date.now(), score });
    const best = bestScore();
    const [title, line] = score >= 60 ? [s.g1t, s.g1] : score >= 48 ? [s.g2t, s.g2] : score >= 36 ? [s.g3t, s.g3] : [s.g4t, s.g4];
    const scoreEl = h('b', { class: 'num' }, fresh ? '0' : String(score));

    const tiles = h('div', { class: 'pg-ftiles' }, ...GAUGES.map(({ id }) => {
      const d = final[id] - START[id];
      return h('div', { class: 'pg-ftile' },
        h('p', { class: 't' }, svg(GAUGE_ICON[id]), label(id)),
        h('p', { class: 'v' }, h('b', { class: 'num' }, String(final[id])), h('em', { class: d > 0 ? 'up' : d < 0 ? 'down' : 'flat' }, d ? signed(d) : '0')),
        h('small', { class: 'num' }, `${s.before}: ${START[id]} · ${s.after}: ${final[id]}`));
    }));

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
      h('ol', { class: 'pg-recap' }, ...DECISIONS.map((d, i) => {
        const a = answers[i];
        const ch = a === null || a === undefined ? undefined : d.choices[a];
        return h('li', { class: ch ? '' : 'skipped' }, ch ? well(PRIORITY_ICONS[ch.main]) : well(ICON.arrowRight),
          h('div', null, h('small', null, l(d.prompt)), h('strong', null, ch ? l(ch.title) : s.skipped)));
      })));

    const report = h('section', { class: 'pg-final', 'aria-labelledby': 'pg-final-title' },
      h('div', { class: 'pg-fhead' },
        h('div', { class: 'pg-ftitle' }, h('p', { class: 'pg-kicker' }, s.report), h('h2', { id: 'pg-final-title' }, title), h('p', null, line)),
        h('div', { class: 'pg-fscore' }, h('small', null, s.score), h('p', null, scoreEl, h('span', null, '/100')),
          record && best !== null ? h('span', { class: 'pg-record' }, s.newBest) : best !== null ? h('small', null, fmt(s.best, { n: best })) : null)),
      tiles,
      profileEl,
      h('div', { class: 'pg-factions' },
        h('button', { class: 'btn pg-white', type: 'button', onclick: again }, svg(ICON.refresh), s.again),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => void share(shareText) }, svg(ICON.share), s.share),
        saveBtn),
      recap);
    grid.hidden = true;
    finalEl.replaceChildren(report);
    if (fresh) {
      cleanups.push(tween(scoreEl, 0, score, 1400, String));
      report.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      (report.querySelector('h2') as HTMLElement | null)?.setAttribute('tabindex', '-1');
      (report.querySelector('h2') as HTMLElement | null)?.focus({ preventScroll: true });
      if (record || score >= 60) window.setTimeout(() => { if (alive) confetti(report); }, 700);
    }
  };

  if (answers.length === N) drawFinal(false); else drawDecide();
  return () => { alive = false; for (const f of cleanups) f(); };
}
