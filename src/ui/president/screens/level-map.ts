import { h, svg } from '../../../lib/dom';
import { S, fmt, l } from '../../../i18n';
import { CITIES, LEVELS } from '../../../data/president-levels.ts';
import { scoreOf } from '../../../lib/president-rules.ts';
import { toast } from '../../toast';
import { GI } from '../art';
import { chip, ghost, hud, mapBox, primary, stars, type Ctx } from '../parts';
import { sfx, vibrate } from '../sound';

/** Level map (Stitch « s19-level-map »): the five years as nodes on the map of Haiti; only the current one opens. */
export function mapScreen(c: Ctx): HTMLElement {
  const s = S().pres;
  const r = c.term?.r;
  if (!r) return h('div');
  const y = r.year;
  const lv = LEVELS[y] ?? LEVELS[0];
  if (!lv) return h('div');
  // Before a year is opened, the taxes and delayed events have not landed yet.
  const st = r.d === 0 ? (r.years[y]?.start.before ?? r.stats) : r.stats;
  const start = () => { sfx.tap(); c.go(r.d === 0 ? 'intro' : 'decision'); };

  const box = mapBox(st, {
    bare: true,
    levels: { year: y, done: false, stars: r.stars, labelOf: (i, state) => fmt(state === 'lock' ? s.nodeLocked : s.nodeLabel, { y: i + 1, n: l(LEVELS[i]?.name) }) },
  });
  box.querySelectorAll<SVGGElement>('.gm-node').forEach((node) => {
    const i = Number(node.dataset.y);
    const act = () => {
      if (i === y) { start(); return; }
      toast(i < y ? fmt(s.doneToast, { y: i + 1 }) : fmt(s.lockedToast, { y: y + 1 }));
      vibrate(30);
    };
    node.addEventListener('click', act);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  });

  const card = h('div', { class: 'gm-card gm-yearcard' },
    h('p', { class: 'gm-kicker muted' }, fmt(s.yearCity, { y: y + 1, c: l(CITIES[lv.city].name) })),
    h('h3', null, `${l(lv.name)}: ${l(lv.theme)}`),
    h('p', { class: 'gm-muted' }, s.yearLead),
    primary(fmt(r.d > 0 ? s.continueYear : s.play, { y: y + 1 }), start, GI.play));

  const years = h('ol', { class: 'gm-card gm-years' }, ...LEVELS.map((v, i) =>
    h('li', null, h('b', null, fmt(s.year, { y: i + 1 })), h('span', { class: 'gm-muted' }, l(v.name)),
      i < y ? stars(r.stars[i] ?? 0, 'sm') : i === y ? chip(s.inProgress, undefined, 'tint') : h('span', { class: 'gm-lock', title: fmt(s.nodeLocked, { y: i + 1, n: l(v.name) }) }, svg(GI.lock)))));

  return h('div', { class: 'gm-cols gm-mapscreen' },
    h('div', { class: 'gm-row gm-top' }, ghost(s.home, () => c.go('home')), h('span', { class: 'grow' }), chip(fmt(s.stateOf, { n: scoreOf(st) }), undefined, 'soft')),
    h('h2', { class: 'gm-h2', tabindex: -1, 'data-focus': '' }, s.mapTitle),
    h('div', { class: 'gm-side' }, box),
    hud(st), card, years);
}
