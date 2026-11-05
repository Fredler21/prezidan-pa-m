import { LANGS, type Lang } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, getLang, setLang } from '../i18n';
import { LANG_NAMES } from '../i18n/strings';
import type { Route } from '../router';
import { accountControls } from './account';
import { IMG } from '../data/images';

const flag = () => h('img', { class: 'flag-sm', src: IMG.flag.src, width: 20, height: 12, alt: '', decoding: 'async' });

function langSelect(): HTMLElement {
  const sel = h('select', { 'aria-label': S().langLabel, onchange: (e: Event) => setLang((e.target as HTMLSelectElement).value as Lang) },
    ...LANGS.map((code) => { const o = h('option', { value: code }, LANG_NAMES[code]); if (code === getLang()) o.selected = true; return o; }));
  return h('div', { class: 'lang' }, sel);
}

/** Right side of the header: the language pill and the account controls (« Konekte », « Kreye kont » or the visitor's initial). */
function langPill(): HTMLElement {
  return h('div', { class: 'hdr-right' }, langSelect(), accountControls(() => { const el = document.getElementById('header'); if (el) fitHeader(el); }));
}

/**
 * Phones: the account buttons always stay on the header row. When they do not fit next to the
 * wordmark (long labels, a narrow screen, large system text), the wordmark text goes first, then
 * the sign-up button (the dialog still opens on either tab).
 */
function fitHeader(el: HTMLElement): void {
  el.classList.remove('fit-1', 'fit-2');
  const row = el.querySelector<HTMLElement>('.hdr-row');
  const right = row?.querySelector<HTMLElement>('.hdr-right');
  if (!row || !right || window.innerWidth >= 1024) return;
  const tight = () => {
    const r = row.getBoundingClientRect(), rr = right.getBoundingClientRect();
    const left = row.querySelector<HTMLElement>('.hdr-left')?.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(row).paddingRight) || 0;
    return rr.right > r.right - pad + 0.5 || (left !== undefined && left.width > 0 && left.right > rr.left - 4);
  };
  if (tight()) el.classList.add('fit-1');
  if (tight()) el.classList.add('fit-2');
}
let fitFrame = 0;
const refit = () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(() => { const el = document.getElementById('header'); if (el) fitHeader(el); }); };
window.addEventListener('resize', refit);
void document.fonts?.ready.then(refit);

/** Desktop navigation (hidden on phones, where the bottom tabs take over). */
function topNav(route: Route): HTMLElement {
  const s = S().nav;
  const active: Partial<Record<Route, Route>> = { home: 'home', start: 'start', match: 'candidates', candidates: 'candidates', vote: 'candidates', results: 'results', poll: 'poll', admin: 'poll', quiz: 'quiz', president: 'quiz' };
  const cur = active[route];
  const links: { route: Route; label: string }[] = [
    { route: 'home', label: s.home }, { route: 'start', label: s.priorities }, { route: 'candidates', label: s.candidates },
    { route: 'results', label: s.results }, { route: 'poll', label: s.poll }, { route: 'quiz', label: s.quiz },
  ];
  return h('nav', { class: 'topnav', 'aria-label': S().navLabel }, ...links.map((x) =>
    h('a', { href: `#${x.route}`, 'aria-current': x.route === cur ? 'page' : undefined }, x.label)));
}

const wordmark = (title?: string, deskOnly = Boolean(title)) => h('a', { class: deskOnly ? 'wordmark desk-only' : 'wordmark', href: '#home' }, svg(ICON.brand), h('span', { class: 'wm-text' }, S().appName),
  title ? h('span', { class: 'hdr-crumb' }, `· ${title}`) : null);

/** Top-level pages carry the wordmark; drill-in pages a back arrow and a title (desktop: wordmark · title). */
export function renderHeader(route: Route): void {
  const el = document.getElementById('header');
  if (!el) return;
  build(el, route);
  fitHeader(el);
}

function build(el: HTMLElement, route: Route): void {
  clear(el);
  const s = S();
  el.className = route === 'home' || route === 'start' ? 'hdr with-strip' : 'hdr';

  if (route === 'home' || route === 'start') {
    const wm = wordmark();
    wm.append(h('span', { class: 'strip-inline desk-only' }, flag(), s.tagline));
    el.append(
      h('div', { class: 'wrap hdr-row' }, h('div', { class: 'hdr-left' }, wm), topNav(route), langPill()),
      h('div', { class: 'strip mobile-only' }, h('span', { class: 'strip-tag' }, flag(), s.tagline), langSelect()),
    );
    return;
  }

  const topLevel: Partial<Record<Route, string>> = { results: s.results.title, poll: s.poll.title, admin: s.admin.title, quiz: s.quiz.title, president: s.pres.title };
  const top = topLevel[route];
  if (top) {
    el.append(h('div', { class: 'wrap hdr-row' },
      h('div', { class: 'hdr-left' }, h('span', { class: 'wordmark mobile-only' }, top), wordmark(undefined, true)),
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
