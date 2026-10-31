import { LANGS } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, getLang, setLang } from '../i18n';
import { LANG_NAMES } from '../i18n/strings';
import type { Route } from '../router';

function langSelect(): HTMLElement {
  const sel = h('select', { 'aria-label': S().langLabel, onchange: (e: Event) => setLang((e.target as HTMLSelectElement).value as typeof LANGS[number]) },
    ...LANGS.map((code) => { const o = h('option', { value: code }, LANG_NAMES[code]); if (code === getLang()) o.selected = true; return o; }));
  return h('div', { class: 'lang' }, sel);
}

const BRAND_ICON = '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M18 40h28l-3 8H21z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M26 34l8-18 8 18" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 28h10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M14 40h36" stroke="#D41E3C" stroke-width="4" stroke-linecap="round"/></svg>';

export function renderHeader(route: Route): void {
  const el = document.getElementById('header');
  if (!el) return;
  clear(el);
  const s = S();
  const titles: Partial<Record<Route, string>> = { match: s.match.title, candidates: s.match.allTitle, vote: s.vote.title, results: s.results.title, about: s.about.title, poll: s.poll.title, admin: s.admin.title };
  if (route === 'start') {
    el.append(
      h('div', { class: 'wrap' }, h('a', { class: 'brand', href: '#start' }, svg(BRAND_ICON), s.appName), langSelect()),
      h('div', { class: 'tagline' }, s.tagline),
    );
    return;
  }
  const back = h('a', { class: 'iconbtn', href: '#start', 'aria-label': s.back, html: ICON.back });
  el.append(h('div', { class: 'wrap' }, h('div', { class: 'hdr-left' }, back, h('span', { class: 'hdr-title' }, titles[route] ?? s.appName)), langSelect()));
}
