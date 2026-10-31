import { h, svg, clear } from '../lib/dom';
import { PRIORITY_ICONS, ICON } from '../lib/icons';
import { PRIORITIES, MAX_PICKS } from '../data/priorities';
import { S, fmt, l } from '../i18n';
import { state, togglePick } from '../state';
import { renderBottom } from './nav';
import { toast } from './toast';
import { footer } from './common';

export function renderStart(main: HTMLElement): void {
  clear(main);
  const s = S();
  const reveal = !state.revealed;

  const hero = h('section', { class: reveal ? 'hero reveal' : 'hero' },
    h('div', { class: 'wrap' }, h('h1', null, s.hero.title), h('p', null, s.hero.sub)));

  const count = h('span', { class: 'count' });
  const grid = h('div', { class: 'grid', role: 'group', 'aria-label': s.hero.gridHeading });
  const tiles = new Map<string, HTMLButtonElement>();

  const sync = () => {
    count.textContent = fmt(s.hero.picked, { n: state.picks.length });
    const full = state.picks.length >= MAX_PICKS;
    for (const p of PRIORITIES) {
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
      btn.setAttribute('aria-label', on ? `${l(p.label)} — ${rank + 1}` : l(p.label));
    }
    renderBottom('start');
  };

  PRIORITIES.forEach((p, i) => {
    const btn = h('button', {
      class: 'tile', type: 'button', 'aria-pressed': 'false', style: `--i:${i}`,
      onclick: () => { if (!togglePick(p.id)) toast(s.hero.hintFull); sync(); },
    }, svg(PRIORITY_ICONS[p.id]), h('span', null, l(p.label)));
    tiles.set(p.id, btn);
    grid.append(btn);
  });

  const body = h('section', { class: reveal ? 'wrap reveal' : 'wrap' },
    h('div', { class: 'grid-head' }, h('h2', null, s.hero.gridHeading), count),
    grid,
    h('div', { class: 'note', style: 'margin-top:20px' }, svg(ICON.info), h('p', null, s.hero.note)),
    footer(),
  );
  main.append(hero, body);
  sync();
  state.revealed = true;
}
