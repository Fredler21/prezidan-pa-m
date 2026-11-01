import type { Candidate, PriorityId, Source } from '../types';
import { h, svg } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { avatarColor, initials } from '../lib/util';
import { S, fmt, l, fmtDate } from '../i18n';
import { STORAGE_MODE } from '../storage';
import { content } from '../content';
import type { Route } from '../router';

export function priorityLabel(id: PriorityId): string {
  return l(content().priorities.find((p) => p.id === id)?.label);
}

/** Line icon for a priority; ids added later in Firestore fall back to a generic icon. */
export function priorityIcon(id: string): string {
  return (PRIORITY_ICONS as Record<string, string | undefined>)[id] ?? ICON.generic;
}

/** Icon in a tinted circular well (tiles, profile rows, method list). */
export function well(markup: string): HTMLElement {
  return h('span', { class: 'well', 'aria-hidden': 'true' }, svg(markup));
}

export function avatar(c: Candidate, large = false): HTMLElement {
  const size = large ? 64 : 52;
  const el = h('div', { class: large ? 'avatar lg' : 'avatar', 'aria-hidden': 'true' });
  if (c.photo) el.append(h('img', { src: `/photos/${c.photo}`, alt: '', loading: 'lazy', decoding: 'async', width: size, height: size }));
  else { el.style.setProperty('--avatar', avatarColor(c.id)); el.textContent = initials(c.name); }
  return el;
}

function nameBlock(c: Candidate, extra?: Node | null): HTMLElement {
  return h('div', { class: 'cand-name' },
    h('strong', null, c.name),
    extra ?? null,
    h('span', { class: 'party' }, c.party));
}

export interface CardOptions {
  onClick: () => void;
  /** Visitor's picks and the ones this candidate matches: renders the match block. */
  picks?: readonly PriorityId[];
  matched?: readonly PriorityId[];
}

/** The one candidate card. Identical format and size for every candidate of the same variant. */
export function candidateCard(c: Candidate, o: CardOptions): HTMLButtonElement {
  const btn = h('button', { class: 'cand', type: 'button', onclick: o.onClick, 'aria-haspopup': 'dialog' },
    h('div', { class: 'cand-row' }, avatar(c), nameBlock(c), svg(ICON.chevronRight, 'ico chev')));
  if (o.picks && o.matched) {
    const n = o.picks.length, m = o.matched.length;
    const label = fmt(S().match.matchOf, { m, n });
    const match = h('div', { class: 'match' },
      h('div', { class: 'match-line num' }, label),
      h('div', { class: 'bar', role: 'img', 'aria-label': label }, h('i', { class: m ? 'on' : '', style: `width:${n ? (m / n) * 100 : 0}%` })));
    if (m > 0) match.append(h('div', { class: 'chips' }, ...o.matched.map((id) => h('span', { class: 'chip' }, priorityLabel(id)))));
    else match.append(h('p', { class: 'none' }, S().match.noMatch));
    btn.append(match);
  }
  return btn;
}

/** Result row: same card, percentage instead of the chevron, own choice marked by a rail + pill. */
export function resultCard(c: Candidate, percent: number, mine: boolean): HTMLElement {
  const you = mine ? h('span', { class: 'pill-you' }, svg(ICON.check), S().results.yourChoice) : null;
  return h('div', { class: mine ? 'cand mine' : 'cand' },
    h('div', { class: 'cand-row' }, avatar(c), nameBlock(c, you), h('span', { class: 'pct' }, `${percent} %`)),
    h('div', { class: 'bar thick', role: 'img', 'aria-label': `${c.name}: ${percent} %` }, h('i', { class: percent ? 'on' : '', style: `width:${percent}%` })));
}

export function note(text: string, icon: string = ICON.info, asCard = true): HTMLElement {
  return h('div', { class: asCard ? 'card note' : 'note' }, svg(icon), h('p', null, text));
}

export function sourceList(sources: readonly Source[]): HTMLElement {
  return h('div', { class: 'links' }, ...sources.map((s) =>
    h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' },
      h('span', null, h('span', { class: 'lt' }, s.label), s.date ? h('small', null, fmtDate(s.date)) : null),
      svg(ICON.outward))));
}

/** Four-step progress rail under the header on the flow pages. */
export function rail(current: 'candidates' | 'vote' | 'results'): HTMLElement {
  const s = S();
  const steps: { key: string; route: Route; label: string }[] = [
    { key: 'start', route: 'start', label: s.nav.priorities },
    { key: 'candidates', route: 'match', label: s.nav.candidates },
    { key: 'vote', route: 'vote', label: s.vote.title },
    { key: 'results', route: 'results', label: s.nav.results },
  ];
  const idx = steps.findIndex((x) => x.key === current);
  return h('nav', { class: 'rail', 'aria-label': s.railLabel }, ...steps.map((st, i) => {
    const cls = i < idx ? 'done' : i === idx ? 'cur' : '';
    return h('a', { class: cls, href: `#${st.route}`, 'aria-current': i === idx ? 'step' : undefined }, h('i', { 'aria-hidden': 'true' }), st.label);
  }));
}

/** Shown only in localStorage demo mode so nobody mistakes device-local votes for live ones. */
export function demoBadge(): HTMLElement | null {
  if (STORAGE_MODE !== 'local') return null;
  return h('span', { class: 'mode' }, h('i', { 'aria-hidden': 'true' }), S().demoMode);
}

export function footer(): HTMLElement {
  const s = S();
  const f = h('div', { class: 'foot' });
  const demo = demoBadge();
  if (demo) f.append(demo, h('br'));
  f.append(h('span', { class: 'foot-brand' }, `${s.appName} · Ayiti 2027`),
    h('nav', { class: 'foot-links', 'aria-label': s.nav.aboutUs },
      h('a', { href: '#about-us' }, s.nav.aboutUs), h('a', { href: '#about' }, s.nav.about),
      h('a', { href: '#privacy' }, s.nav.privacy), h('a', { href: '#terms' }, s.nav.terms)));
  return f;
}
