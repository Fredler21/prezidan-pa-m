import { LANGS, type Lang } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, getLang, setLang } from '../i18n';
import { LANG_NAMES } from '../i18n/strings';
import type { Route } from '../router';
import { accountButton } from './account';

/** Right side of the header: the account button and the language pill. */
function langPill(): HTMLElement {
  const sel = h('select', { 'aria-label': S().langLabel, onchange: (e: Event) => setLang((e.target as HTMLSelectElement).value as Lang) },
    ...LANGS.map((code) => { const o = h('option', { value: code }, LANG_NAMES[code]); if (code === getLang()) o.selected = true; return o; }));
  return h('div', { class: 'hdr-right' }, accountButton(), h('div', { class: 'lang' }, sel));
}

/** Desktop navigation (hidden on phones, where the bottom tabs take over). */
function topNav(route: Route): HTMLElement {
  const s = S().nav;
  const active: Partial<Record<Route, Route>> = { home: 'home', start: 'start', match: 'candidates', candidates: 'candidates', vote: 'candidates', results: 'results', poll: 'poll', admin: 'poll' };
  const cur = active[route];
  const links: { route: Route; label: string }[] = [
    { route: 'home', label: s.home }, { route: 'start', label: s.priorities }, { route: 'candidates', label: s.candidates },
    { route: 'results', label: s.results }, { route: 'poll', label: s.poll },
  ];
  return h('nav', { class: 'topnav', 'aria-label': S().navLabel }, ...links.map((x) =>
    h('a', { href: `#${x.route}`, 'aria-current': x.route === cur ? 'page' : undefined }, x.label)));
}

const wordmark = (title?: string) => h('a', { class: title ? 'wordmark desk-only' : 'wordmark', href: '#home' }, svg(ICON.brand), S().appName,
  title ? h('span', { class: 'hdr-crumb' }, `· ${title}`) : null);

/** Top-level pages carry the wordmark; drill-in pages a back arrow and a title (desktop: wordmark · title). */
export function renderHeader(route: Route): void {
  const el = document.getElementById('header');
  if (!el) return;
  clear(el);
  const s = S();
  el.className = 'hdr';

  if (route === 'home' || route === 'start') {
    const wm = wordmark();
    wm.append(h('span', { class: 'strip-inline desk-only' }, s.tagline));
    el.append(
      h('div', { class: 'wrap hdr-row' }, h('div', { class: 'hdr-left' }, wm), topNav(route), langPill()),
      h('div', { class: 'strip mobile-only' }, s.tagline),
    );
    return;
  }

  const topLevel: Partial<Record<Route, string>> = { results: s.results.title, poll: s.poll.title, admin: s.admin.title };
  const top = topLevel[route];
  if (top) {
    el.append(h('div', { class: 'wrap hdr-row' },
      h('div', { class: 'hdr-left' }, h('span', { class: 'wordmark mobile-only' }, top), wordmark()),
      topNav(route), langPill()));
    return;
  }

  const titles: Partial<Record<Route, string>> = { match: s.match.title, candidates: s.match.allTitle, vote: s.vote.title, about: s.about.title, 'about-us': s.nav.aboutUs, privacy: s.nav.privacy, terms: s.nav.terms };
  const title = titles[route] ?? s.appName;
  const back = route === 'vote' ? '#match' : route === 'match' ? '#start' : '#home';
  el.append(h('div', { class: 'wrap hdr-row' },
    h('div', { class: 'hdr-left' }, h('a', { class: 'hdr-back', href: back, 'aria-label': s.back }, svg(ICON.back)), wordmark(title)),
    h('span', { class: 'hdr-title mobile-only' }, title),
    topNav(route), langPill()));
}
