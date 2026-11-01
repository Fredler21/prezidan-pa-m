import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt } from '../i18n';
import { state } from '../state';
import { MAX_PICKS } from '../data/priorities';
import { go, type Route } from '../router';

type Chrome = 'nav' | 'bar' | 'none';

/**
 * Bottom chrome per route (docs/design/DESIGN.md section 10, plus the Home tab):
 *   Home: nav · Start: nav until the first pick, then the action bar · Kandida: action bar with the
 *   red Vote · Vote: its own vote bar (rendered by the view) · Rezilta, Sondaj, Admin: nav · About: none.
 */
export function renderBottom(route: Route): void {
  const el = document.getElementById('bottom');
  if (!el) return;
  clear(el);
  const s = S();
  let chrome: Chrome = 'nav';

  if (route === 'start' && state.picks.length > 0) {
    const n = state.picks.length;
    const hint = n >= MAX_PICKS ? s.hero.hintFull : n === MAX_PICKS - 1 ? s.hero.hintOneMore : s.hero.hintTwoMore;
    el.append(h('div', { class: 'bar-row' },
      h('div', { class: 'txt' }, h('strong', { class: 'num' }, fmt(s.hero.barPicked, { n })), h('small', null, hint)),
      h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go('match') }, s.hero.cta, svg(ICON.arrowRight))));
    chrome = 'bar';
  } else if (route === 'match' || route === 'candidates') {
    el.append(h('div', { class: 'bar-row' },
      h('div', { class: 'txt' }, h('strong', null, s.match.readyTitle), h('small', null, s.match.readySub)),
      h('button', { class: 'btn btn-vote', type: 'button', onclick: () => go('vote') }, svg(ICON.ballot), s.match.voteNow)));
    chrome = 'bar';
  } else if (route === 'vote') {
    chrome = 'bar'; // the vote view mounts its own bar into #bottom
  } else if (route === 'about' || route === 'about-us' || route === 'privacy' || route === 'terms') {
    chrome = 'none';
  } else {
    const tabs: { route: Route; label: string; icon: string; active: Route[] }[] = [
      { route: 'home', label: s.nav.home, icon: ICON.home, active: ['home'] },
      { route: 'start', label: s.nav.priorities, icon: ICON.sliders, active: ['start'] },
      { route: 'candidates', label: s.nav.candidates, icon: ICON.people, active: ['candidates', 'match'] },
      { route: 'results', label: s.nav.results, icon: ICON.bars, active: ['results'] },
      { route: 'poll', label: s.nav.poll, icon: ICON.poll, active: ['poll', 'admin'] },
    ];
    el.append(h('div', { class: 'tabs' }, ...tabs.map((t) =>
      h('a', { class: 'tab', href: `#${t.route}`, 'aria-current': t.active.includes(route) ? 'page' : undefined }, svg(t.icon), t.label))));
  }

  el.classList.toggle('hidden', chrome === 'none');
  el.setAttribute('aria-label', chrome === 'nav' ? s.navLabel : s.actionsLabel);
  document.body.dataset.chrome = chrome;
}
