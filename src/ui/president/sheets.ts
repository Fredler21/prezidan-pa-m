import { h, svg } from '../../lib/dom';
import { ICON } from '../../lib/icons';
import { S, fmt, l } from '../../i18n';
import { BADGES } from '../../data/president-levels.ts';
import { BADGE_ICON, GI } from './art';
import { adviser, chip, primary, type Ctx } from './parts';
import { sfx } from './sound';

/* The two sheets of the game, on the site's bottom-sheet dialog: the badges, and Ti Jan's first-time tutorial. */

let open: HTMLDialogElement | null = null;
let opener: HTMLElement | null = null;

export function closeGameSheet(): void {
  const d = open;
  if (!d) return;
  open = null;
  if (typeof d.close === 'function' && d.open) d.close(); else d.dispatchEvent(new Event('close'));
}

function sheet(label: string, ...content: (Node | null)[]): HTMLDialogElement {
  closeGameSheet();
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const body = h('div', { class: 'sheet-body gm-sheet' }, h('div', { class: 'handle', 'aria-hidden': 'true' }), ...content);
  const dlg = h('dialog', { class: 'sheet gm-dialog', 'aria-label': label },
    h('button', { class: 'sheet-close', type: 'button', 'aria-label': S().close, onclick: () => closeGameSheet() }, svg(ICON.close)), body);
  dlg.addEventListener('close', () => { dlg.remove(); if (open === dlg) open = null; opener?.focus({ preventScroll: true }); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeGameSheet(); }); // the backdrop
  document.body.append(dlg);
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  open = dlg;
  return dlg;
}

/** The eleven badges, the streak and the best score. */
export function openBadges(c: Ctx): void {
  const s = S().pres;
  const have = new Set(c.meta.badges);
  const n = BADGES.filter((b) => have.has(b.id)).length;
  sheet(s.badgesTitle,
    h('h2', { class: 'gm-sheet-title' }, s.badgesTitle),
    h('div', { class: 'gm-row' },
      c.signedIn() ? chip(fmt(s.streakLong, { n: c.meta.streak }), GI.flame, 'soft') : null,
      chip(c.best !== null ? fmt(s.best, { n: c.best }) : s.bestNone, GI.trophy, 'soft')),
    h('div', { class: 'gm-prog' },
      h('span', null, fmt(s.badgesProgress, { n, t: BADGES.length })),
      h('span', { class: 'gm-bar', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.round((n / BADGES.length) * 100)}%` }))),
    h('ul', { class: 'gm-badges' }, ...BADGES.map((b) => {
      const on = have.has(b.id);
      return h('li', { class: on ? 'on' : 'off' },
        h('span', { class: `gm-bw${on ? ' on' : ''}`, 'aria-hidden': 'true', html: BADGE_ICON[b.id] ?? '' }),
        h('b', null, l(b.name)),
        h('span', null, l(b.rule)),
        h('span', { class: 'sr' }, on ? s.badgeOn : s.badgeOff));
    })),
    c.signedIn() ? null : h('p', { class: 'gm-fine' }, s.badgesSignIn));
}

/** Three steps from Ti Jan, the first time a player reaches a decision. */
export function openTutorial(): void {
  const s = S().pres;
  const steps = [s.tut1, s.tut2, s.tut3];
  let i = 0;
  const holder = h('div', { class: 'gm-tut' });
  sheet(fmt(s.tutor, { i: 1 }), holder);
  const draw = () => {
    const next = primary(i < steps.length - 1 ? s.tutNext : s.tutDone, () => {
      sfx.tap();
      if (++i >= steps.length) closeGameSheet(); else draw();
    });
    holder.replaceChildren(adviser('tij', fmt(s.tutor, { i: i + 1 }), h('p', null, steps[i] ?? '')), next);
    next.focus({ preventScroll: true });
  };
  draw();
}
