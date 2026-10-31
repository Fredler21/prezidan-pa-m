import type { Candidate, PriorityId, Source } from '../types';
import { CANDIDATES } from '../data/candidates';
import { PRIORITIES } from '../data/priorities';
import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { avatarColor, initials, shuffle } from '../lib/util';
import { S, fmt, l, fmtDate } from '../i18n';
import { STORAGE_MODE } from '../storage';

/** Random order, fixed for this page load (neutrality rule: random order on every load). */
export const CANDIDATES_SHUFFLED: readonly Candidate[] = shuffle(CANDIDATES);

export function priorityLabel(id: PriorityId): string {
  return l(PRIORITIES.find((p) => p.id === id)?.label);
}

export function avatar(c: Candidate, large = false): HTMLElement {
  const el = h('div', { class: large ? 'avatar lg' : 'avatar', style: `--av:${avatarColor(c.id)}`, 'aria-hidden': 'true' });
  if (c.photo) el.append(h('img', { src: `/photos/${c.photo}`, alt: '', loading: 'lazy', width: large ? 72 : 48, height: large ? 72 : 48 }));
  else el.textContent = initials(c.name);
  return el;
}

export interface CardOptions {
  onClick: () => void;
  /** Visitor's picks and the ones this candidate matches, renders the match bar. */
  picks?: readonly PriorityId[];
  matched?: readonly PriorityId[];
  /** Radio-style selectable row (vote picker). */
  radio?: boolean;
  selected?: boolean;
}

/** The one candidate card. Identical format and size for everyone. */
export function candidateCard(c: Candidate, o: CardOptions): HTMLButtonElement {
  const btn = h('button', { class: 'cand', type: 'button', onclick: o.onClick, 'aria-pressed': o.radio ? String(Boolean(o.selected)) : undefined });
  const top = h('div', { class: 'cand-top' },
    avatar(c),
    h('div', { class: 'cand-name' }, h('strong', null, c.name), h('span', null, c.party)),
    o.radio ? h('span', { class: 'radio', 'aria-hidden': 'true' }) : svg(ICON.chevronRight, 'chev'),
  );
  btn.append(top);
  if (o.picks && o.matched) {
    const n = o.picks.length, m = o.matched.length;
    const s = S().match;
    const match = h('div', { class: 'match' },
      h('div', { class: 'match-line' }, h('span', null, fmt(s.matchOf, { m, n })), h('b', null, `${n ? Math.round((m / n) * 100) : 0} %`)),
      h('div', { class: 'bar', role: 'img', 'aria-label': fmt(s.matchOf, { m, n }) }, h('i', { style: `width:${n ? (m / n) * 100 : 0}%` })),
    );
    if (m > 0) match.append(h('div', { class: 'chips' }, ...o.matched.map((id) => h('span', { class: 'chip' }, priorityLabel(id)))));
    else match.append(h('p', { class: 'muted small', style: 'margin-top:8px;font-style:italic' }, s.noMatch));
    btn.append(match);
  }
  return btn;
}

export function note(text: string, icon: string = ICON.info, quiet = false): HTMLElement {
  return h('div', { class: quiet ? 'note quiet' : 'note' }, svg(icon), h('p', null, text));
}

export function sourceList(sources: readonly Source[]): HTMLElement {
  return h('div', { class: 'srclist' }, ...sources.map((s) =>
    h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' },
      h('span', null, s.label, s.date ? h('small', null, fmtDate(s.date)) : null),
      svg(ICON.external)),
  ));
}

/** Shown only in localStorage demo mode so nobody mistakes device-local votes for live ones. */
export function demoBadge(): HTMLElement | null {
  if (STORAGE_MODE !== 'local') return null;
  return h('span', { class: 'mode demo' }, h('i', { 'aria-hidden': 'true' }), S().demoMode);
}

export function footer(): HTMLElement {
  const f = h('div', { class: 'foot' });
  const demo = demoBadge();
  if (demo) f.append(demo, h('br'));
  f.append(h('a', { href: '#about' }, S().nav.about));
  return f;
}
