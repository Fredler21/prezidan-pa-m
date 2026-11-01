import { LANGS, type Lang } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, getLang, setLang } from '../i18n';
import { LANG_NAMES } from '../i18n/strings';
import type { Route } from '../router';

function langPill(): HTMLElement {
  const sel = h('select', { 'aria-label': S().langLabel, onchange: (e: Event) => setLang((e.target as HTMLSelectElement).value as Lang) },
    ...LANGS.map((code) => { const o = h('option', { value: code }, LANG_NAMES[code]); if (code === getLang()) o.selected = true; return o; }));
  return h('div', { class: 'lang' }, sel);
}

/** Top-level pages carry the wordmark or page name; drill-in pages a back arrow and a centered title. */
export function renderHeader(route: Route): void {
  const el = document.getElementById('header');
  if (!el) return;
  clear(el);
  const s = S();
  el.className = 'hdr';

  if (route === 'home' || route === 'start') {
    el.append(
      h('div', { class: 'wrap hdr-row top' }, h('a', { class: 'wordmark', href: '#home' }, svg(ICON.brand), s.appName), langPill()),
      h('div', { class: 'strip' }, s.tagline),
    );
    return;
  }

  const topLevel: Partial<Record<Route, string>> = { results: s.results.title, poll: s.poll.title, admin: s.admin.title };
  const top = topLevel[route];
  if (top) {
    el.append(h('div', { class: 'wrap hdr-row top' }, h('span', { class: 'wordmark' }, top), langPill()));
    return;
  }

  const titles: Partial<Record<Route, string>> = { match: s.match.title, candidates: s.match.allTitle, vote: s.vote.title, about: s.about.title };
  el.append(h('div', { class: 'wrap hdr-row' },
    h('a', { class: 'hdr-back', href: route === 'vote' ? '#match' : route === 'match' ? '#start' : '#home', 'aria-label': s.back }, svg(ICON.back)),
    h('span', { class: 'hdr-title' }, titles[route] ?? s.appName),
    langPill()));
}
