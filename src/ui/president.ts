import type { PriorityId } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, l } from '../i18n';
import { DECISIONS, PROFILES, topPriorities } from '../data/president-game';
import { gameResult, saveGameResult, markSeenCandidates } from '../lib/progress';
import { matchCandidates, whatsappUrl } from '../lib/util';
import { candidatesShuffled } from '../content';
import { state, setPicks } from '../state';
import { SITE_URL } from '../data/site';
import { avatar, footer, priorityLabel, well } from './common';
import { openProfile } from './profile';
import { whyVote } from './why-vote';
import { toast } from './toast';

/*
 * « Si m te prezidan » (Stitch « s12-president »): eight decisions, one at a time, with a live
 * profile on the side. The result names a profile from the three heaviest priorities and lists
 * the candidates whose public record covers them, ranked like the match page (ties stay in
 * random order). Answers stay on the device; saving them as priorities is the player's choice.
 */

const N = DECISIONS.length;
const MATCH_ROWS = 3;

export function renderPresident(main: HTMLElement): () => void {
  clear(main);
  const s = S().pres;
  const saved = gameResult();
  let answers: (number | null)[] = saved && saved.answers.length === N ? saved.answers.slice() : Array<number | null>(N).fill(null);
  let step = saved ? N : 0; // N means finished: the result is shown
  let alive = true;

  const left = h('div', { class: 'pg-main' });
  const right = h('aside', { class: 'pg-side' });
  const grid = h('div', { class: 'pg-grid' }, left, right);
  main.append(h('div', { class: 'wrap pg-page' },
    h('div', { class: 'pg-head' }, h('p', { class: 'kicker' }, s.kicker), h('h1', null, s.title), h('p', { class: 'lead' }, s.lead)),
    grid, whyVote(), footer()));

  const chip = (id: PriorityId) => h('span', { class: 'pg-chip' }, svg(PRIORITY_ICONS[id]), priorityLabel(id));

  /** Side card while playing: the profile forming from the answers so far. */
  const drawLive = () => {
    const top = topPriorities(answers);
    const lead = top[0];
    right.className = 'pg-side playing';
    right.replaceChildren(h('div', { class: 'pg-res pg-live', 'aria-live': 'polite' },
      h('p', { class: 'pg-kicker' }, s.profileKicker),
      lead
        ? h('div', { class: 'pg-prof' }, h('span', { class: 'pg-prof-icon' }, svg(PRIORITY_ICONS[lead])),
          h('div', null, h('h2', null, l(PROFILES[lead].title)), h('p', null, l(PROFILES[lead].line))))
        : h('div', { class: 'pg-prof' }, h('span', { class: 'pg-prof-icon ghost' }, svg(ICON.palace)),
          h('div', null, h('h2', null, s.building), h('p', null, s.buildingHint))),
      top.length ? h('p', { class: 'pg-sofar' }, s.soFar) : null,
      top.length ? h('div', { class: 'pg-chips' }, ...top.map(chip)) : null));
  };

  const finish = () => {
    saveGameResult({ answers: answers.slice(), top: topPriorities(answers), at: Date.now() });
    step = N;
    draw();
    grid.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  const go = (to: number) => {
    if (to >= N) { finish(); return; }
    step = Math.max(0, to);
    draw();
    (left.querySelector('.pg-q') as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const drawDecision = () => {
    const d = DECISIONS[step];
    if (!d) return;
    const last = step === N - 1;
    const next = h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { if (answers[step] !== null) go(step + 1); } }, last ? s.finish : s.next, svg(ICON.arrowRight));
    next.disabled = answers[step] === null;
    const opts = h('div', { class: 'pg-opts', role: 'radiogroup', 'aria-labelledby': 'pg-q' });
    const buttons = d.choices.map((ch, i) => {
      const b = h('button', { class: 'pg-opt', type: 'button', role: 'radio', 'aria-checked': String(answers[step] === i), style: `--i:${i}`, onclick: () => pick(i) },
        well(PRIORITY_ICONS[ch.main]),
        h('span', { class: 'pg-opt-text' }, h('strong', null, l(ch.title)), h('span', null, l(ch.sub))),
        h('span', { class: 'pg-check', 'aria-hidden': 'true' }, svg(ICON.check)));
      opts.append(b);
      return b;
    });
    const pick = (i: number) => {
      answers[step] = i;
      buttons.forEach((b, j) => b.setAttribute('aria-checked', String(i === j)));
      next.disabled = false;
      drawLive();
    };
    const back = h('button', { class: 'pg-back', type: 'button', onclick: () => go(step - 1) }, svg(ICON.back), S().back);
    back.disabled = step === 0;
    left.replaceChildren(h('div', { class: 'pg-card' },
      h('div', { class: 'pg-top' },
        h('span', { class: 'num' }, fmt(s.step, { i: step + 1, n: N })),
        h('button', { class: 'pg-skip', type: 'button', onclick: () => { answers[step] = null; go(step + 1); } }, s.skip)),
      h('div', { class: 'pg-prog', 'aria-hidden': 'true' }, ...DECISIONS.map((_, i) => h('i', { class: i < step ? 'done' : i === step ? 'now' : '' }))),
      h('div', { class: 'pg-body' },
        h('div', { class: 'pg-scn' },
          h('span', { class: 'pg-icon' }, svg(PRIORITY_ICONS[d.icon])),
          h('div', null, h('h2', { class: 'pg-q', id: 'pg-q', tabindex: -1 }, l(d.prompt)), h('p', { class: 'pg-hint' }, s.hint))),
        opts),
      h('div', { class: 'pg-actions' }, back, next)));
    grid.classList.remove('done');
    drawLive();
  };

  const share = async (text: string) => {
    try {
      if (typeof navigator.share === 'function') { await navigator.share({ text, title: S().appName }); return; }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    window.open(whatsappUrl(text), '_blank', 'noopener');
  };
  const again = () => { answers = Array<number | null>(N).fill(null); go(0); };

  const drawResult = () => {
    grid.classList.add('done');
    const top = topPriorities(answers);
    const lead = top[0];
    // recap of the decisions (left), the profile and the matching candidates (right)
    const recap = h('ol', { class: 'pg-recap' }, ...DECISIONS.map((d, i) => {
      const a = answers[i];
      const ch = a === null || a === undefined ? undefined : d.choices[a];
      return h('li', { class: ch ? '' : 'skipped' }, ch ? well(PRIORITY_ICONS[ch.main]) : well(ICON.arrowRight),
        h('div', null, h('small', null, l(d.prompt)), h('strong', null, ch ? l(ch.title) : s.skipped)));
    }));
    left.replaceChildren(h('div', { class: 'pg-card pg-recap-card' },
      h('h2', { class: 'pg-h2' }, s.recap), recap,
      h('div', { class: 'pg-actions' }, h('button', { class: 'btn btn-outline', type: 'button', onclick: again }, svg(ICON.refresh), s.again))));

    right.className = 'pg-side';
    if (!lead) { right.replaceChildren(h('div', { class: 'pg-res' }, h('p', null, s.allSkipped))); return; }
    const prof = PROFILES[lead];
    const { ranked } = matchCandidates(candidatesShuffled(), top);
    const rows = ranked.filter((m) => m.matched.length > 0).slice(0, MATCH_ROWS);
    const list = rows.length
      ? h('div', { class: 'pg-cands' }, ...rows.map((m) => h('button', { class: 'pg-cand', type: 'button', 'aria-haspopup': 'dialog', onclick: () => { markSeenCandidates(); openProfile(m.candidate); } },
        avatar(m.candidate), h('span', { class: 'pg-cand-name' }, h('strong', null, m.candidate.name), h('small', null, m.candidate.party)),
        h('b', { class: 'num' }, fmt(s.matchOf, { m: m.matched.length, n: top.length })))))
      : h('p', { class: 'pg-none' }, s.noMatch);
    const seeMatch = () => h('a', { class: 'btn pg-ghost', href: '#match' }, s.seeMatch, svg(ICON.arrowRight));
    const already = top.length === state.picks.length && top.every((p) => state.picks.includes(p));
    const saveBtn: HTMLElement = already ? seeMatch() : h('button', { class: 'btn pg-ghost', type: 'button' }, svg(ICON.check), s.save);
    if (!already) saveBtn.addEventListener('click', () => { setPicks(top); toast(s.saved); saveBtn.replaceWith(seeMatch()); });
    const text = fmt(s.shareText, { p: l(prof.title), list: top.map(priorityLabel).join(', '), url: `${SITE_URL}/#president` });
    right.replaceChildren(h('div', { class: 'pg-res final' },
      h('p', { class: 'pg-kicker' }, s.profileKicker),
      h('div', { class: 'pg-prof' }, h('span', { class: 'pg-prof-icon' }, svg(PRIORITY_ICONS[lead])),
        h('div', null, h('h2', null, l(prof.title)), h('p', null, l(prof.line)))),
      h('div', { class: 'pg-chips' }, ...top.map(chip)),
      h('hr', { class: 'pg-hr' }),
      h('h3', { class: 'pg-h3' }, s.matchTitle),
      list,
      h('p', { class: 'pg-note' }, svg(ICON.info), s.note),
      h('div', { class: 'pg-res-actions' },
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => void share(text) }, svg(ICON.share), s.share),
        saveBtn)));
  };

  function draw(): void { if (alive) { if (step >= N) drawResult(); else drawDecision(); } }
  draw();
  return () => { alive = false; };
}
