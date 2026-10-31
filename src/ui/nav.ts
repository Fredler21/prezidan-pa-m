import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt } from '../i18n';
import { state } from '../state';
import { MAX_PICKS } from '../data/priorities';
import { go, type Route } from '../router';

/** Bottom bar: tabs everywhere, except on Start once there is a pick, where the action bar takes over. */
export function renderBottom(route: Route): void {
  const el = document.getElementById('bottom');
  if (!el) return;
  clear(el);
  const s = S();
  const n = state.picks.length;

  if (route === 'start' && n > 0) {
    const hint = n >= MAX_PICKS ? s.hero.hintFull : n === MAX_PICKS - 1 ? s.hero.hintOneMore : s.hero.hintTwoMore;
    el.append(h('div', { class: 'wrap' },
      h('div', { class: 'actionbar-text' }, h('strong', null, fmt(s.hero.barPicked, { n })), h('small', null, hint)),
      h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go('match') }, s.hero.cta, svg(ICON.arrowRight)),
    ));
    return;
  }

  const tabs: { route: Route; label: string; icon: string; active: Route[] }[] = [
    { route: 'start', label: s.nav.priorities, icon: ICON.sliders, active: ['start'] },
    { route: 'candidates', label: s.nav.candidates, icon: ICON.people, active: ['candidates', 'match', 'vote'] },
    { route: 'poll', label: s.nav.poll, icon: ICON.poll, active: ['poll', 'admin'] },
    { route: 'results', label: s.nav.results, icon: ICON.bars, active: ['results'] },
  ];
  el.append(h('div', { class: 'wrap' }, h('div', { class: 'tabs' }, ...tabs.map((t) =>
    h('a', { class: 'tab', href: `#${t.route}`, 'aria-current': t.active.includes(route) ? 'page' : undefined }, svg(t.icon), t.label),
  ))));
}
