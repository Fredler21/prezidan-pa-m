import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { MAX_PICKS } from '../data/priorities';
import { S, fmt, l } from '../i18n';
import { state, togglePick } from '../state';
import { content } from '../content';
import { go } from '../router';
import { renderBottom } from './nav';
import { toast } from './toast';
import { footer, note, priorityIcon, well } from './common';

// Faint wrought-iron lace, inline (no image request), masked to fade before the bottom.
const LACE = '<svg class="hero-lace" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="lace" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M0 28A28 28 0 0 0 28 0M28 0A28 28 0 0 0 56 28M56 28A28 28 0 0 0 28 56M28 56A28 28 0 0 0 0 28" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="28" cy="28" r="6" fill="none" stroke="currentColor" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#lace)"/></svg>';

export function renderStart(main: HTMLElement): void {
  clear(main);
  const s = S();
  const reveal = !state.revealed;
  const priorities = content().priorities;

  const next = () => { if (state.picks.length === 0) toast(s.hero.mustPick); else go('match'); };
  const ctaButton = () => h('button', { class: 'btn btn-primary', type: 'button', onclick: next }, s.hero.cta, svg(ICON.arrowRight));

  // Desktop only: a side card in the hero carries the counter, a hint and the call to action.
  const counts = [h('span', { class: 'count' }), h('span', { class: 'count' })];
  const sideHint = h('p', { class: 'caption', style: 'margin:0 0 16px' });
  const side = h('div', { class: 'card hero-side desk-only' },
    h('div', { class: 'sec-row', style: 'margin-bottom:8px' }, h('h2', null, s.hero.gridHeading), counts[1]),
    sideHint,
    ctaButton());
  side.querySelector('.btn')?.classList.add('btn-block');

  const hero = h('section', { class: reveal ? 'hero reveal' : 'hero', html: LACE });
  hero.append(h('div', { class: 'wrap hero-grid' }, h('div', { class: 'hero-text' }, h('h1', null, s.hero.title), h('p', null, s.hero.sub)), side));

  const grid = h('div', { class: 'grid', role: 'group', 'aria-label': s.hero.gridHeading });
  const tiles = new Map<string, HTMLButtonElement>();

  const sync = () => {
    const n = state.picks.length;
    for (const el of counts) el.textContent = fmt(s.hero.picked, { n });
    sideHint.textContent = n >= MAX_PICKS ? s.hero.hintFull : n === MAX_PICKS - 1 ? s.hero.hintOneMore : s.hero.hintTwoMore;
    const full = n >= MAX_PICKS;
    for (const p of priorities) {
      const btn = tiles.get(p.id);
      if (!btn) continue;
      const rank = state.picks.indexOf(p.id);
      const on = rank >= 0;
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('dim', full && !on);
      const badge = btn.querySelector('.badge');
      if (on) {
        if (badge) badge.textContent = String(rank + 1);
        else btn.append(h('span', { class: 'badge', 'aria-hidden': 'true' }, String(rank + 1)));
      } else badge?.remove();
      btn.setAttribute('aria-label', on ? fmt(s.hero.tileRanked, { label: l(p.label), n: rank + 1 }) : l(p.label));
    }
    renderBottom('start');
  };

  priorities.forEach((p, i) => {
    const btn = h('button', {
      class: 'tile', type: 'button', 'aria-pressed': 'false', style: `--i:${i}`,
      onclick: () => { if (!togglePick(p.id)) toast(s.hero.fullToast); sync(); },
    }, well(priorityIcon(p.id)), h('span', { class: 'lbl' }, l(p.label)));
    tiles.set(p.id, btn);
    grid.append(btn);
  });

  const body = h('section', { class: reveal ? 'wrap reveal' : 'wrap' },
    h('div', { class: 'sec-row', style: 'margin-top:24px' }, h('h2', null, s.hero.gridHeading), counts[0]),
    grid,
    h('div', { class: 'grid-cta desk-only' }, ctaButton()),
    h('div', { class: 'gap-24' }, note(s.hero.note, ICON.info)),
    footer(),
  );
  main.append(hero, body);
  sync();
  state.revealed = true;
}
