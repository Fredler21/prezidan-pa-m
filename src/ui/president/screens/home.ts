import { h, svg } from '../../../lib/dom';
import { ICON } from '../../../lib/icons';
import { S, fmt, l } from '../../../i18n';
import { BADGES, CITIES, LEVELS, START } from '../../../data/president-levels.ts';
import { openAccountSheet } from '../../account';
import { GI } from '../art';
import { chip, mapBox, primary, secondary, stars, type Ctx } from '../parts';
import { sfx } from '../sound';

/** Game home (Stitch « s18-home »): title, the living map, take the oath or continue, best score, badges, the 5 levels. */
export function homeScreen(c: Ctx): HTMLElement {
  const s = S().pres;
  const t = c.term;
  const r = t?.r;
  const st = !r ? START : !r.done && r.d === 0 ? (r.years[r.year]?.start.before ?? r.stats) : r.stats;

  const head = h('div', { class: 'gm-head' },
    h('p', { class: 'gm-kicker' }, s.kicker),
    h('h1', { tabindex: -1, 'data-focus': '' }, s.headline),
    h('p', { class: 'gm-lead' }, s.lead));

  const actions = h('div', { class: 'gm-actions' });
  if (!r) actions.append(primary(s.start, () => { sfx.up(); c.newTerm(); }, ICON.arrowRight));
  else if (!r.done) actions.append(primary(fmt(s.resume, { y: r.year + 1 }), () => { sfx.up(); c.go('map'); }, ICON.arrowRight));
  else actions.append(primary(s.seeFinal, () => { sfx.tap(); c.go('final'); }, ICON.arrowRight));
  if (r) actions.append(secondary(s.newTerm, () => { sfx.tap(); c.newTerm(); }, ICON.refresh));

  const chips = h('div', { class: 'gm-row' },
    chip(c.best !== null ? fmt(s.best, { n: c.best }) : s.bestNone, GI.trophy, 'soft'),
    chip(fmt(s.badgeCount, { n: c.meta.badges.length, t: BADGES.length }), GI.medal, 'soft'));

  const levels = h('section', { class: 'gm-levels', 'aria-labelledby': 'gm-lv-title' },
    h('h2', { id: 'gm-lv-title', class: 'gm-h3' }, s.levelsTitle),
    h('ol', { class: 'gm-card gm-lvlist' }, ...LEVELS.map((lv, i) => {
      const state = !r ? (i === 0 ? 'cur' : 'lock') : r.done || i < r.year ? 'done' : i === r.year ? 'cur' : 'lock';
      const tail = state === 'done' ? stars(r?.stars[i] ?? 0, 'sm')
        : state === 'cur' ? chip(r && r.d > 0 ? s.inProgress : s.ready, undefined, 'tint')
        : h('span', { class: 'gm-lock', title: fmt(s.nodeLocked, { y: i + 1, n: l(lv.name) }) }, svg(GI.lock));
      return h('li', { class: `gm-lv ${state}` },
        h('span', { class: 'gm-lvn num', 'aria-hidden': 'true' }, String(i + 1)),
        h('span', { class: 'gm-lvt' }, h('b', null, l(lv.name)), h('span', null, l(CITIES[lv.city].name))),
        tail);
    })));

  return h('div', { class: 'gm-cols gm-home' },
    head,
    h('div', { class: 'gm-side' }, mapBox(st, { labels: true, float: true })),
    actions, chips, levels,
    c.signedIn() ? h('p', { class: 'gm-saved' }, svg(ICON.check), s.saveSigned) : saveInvite());
}

/** Progress is kept for signed-in players only: the invitation for everyone else. */
export function saveInvite(): HTMLElement {
  const s = S().pres;
  return h('div', { class: 'gm-save' },
    h('span', { class: 'gm-well', 'aria-hidden': 'true' }, svg(GI.lock)),
    h('div', null, h('p', null, h('b', null, s.saveTitle)), h('p', { class: 'gm-muted' }, s.saveLead)),
    h('div', { class: 'gm-save-actions' },
      h('button', { class: 'btn gm-btn gm-line', type: 'button', onclick: () => openAccountSheet('in') }, S().account.signIn),
      h('button', { class: 'btn btn-primary gm-btn', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp)));
}
