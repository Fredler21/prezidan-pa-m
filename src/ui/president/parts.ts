import { h, svg } from '../../lib/dom';
import { S, fmt, l } from '../../i18n';
import { ADVISERS, STATS, type AdviserId, type BadgeId, type GameDecision, type StatId, type Stats } from '../../data/president-levels.ts';
import type { Replay } from '../../lib/president-rules.ts';
import type { GameMeta, GameResult } from '../../lib/progress';
import { tween } from '../home';
import { GI, STAT_ICON, avatarSVG, mapSVG, type MapOptions } from './art';

/** The screens of the game, the shared state they read, and the actions they call (see index.ts). */
export type ScreenId = 'home' | 'map' | 'intro' | 'decision' | 'result' | 'report' | 'final';
export interface ShowOptions { fresh?: boolean; year?: number }
export interface Term { ids: string[]; decisions: GameDecision[]; answers: number[]; r: Replay }
export interface Ctx {
  term: Term | null;
  meta: GameMeta;
  best: number | null;
  last: GameResult | null;
  /** The term that just ended beat the best score. */
  record: boolean;
  /** Badges earned since the last year report (shown there once). */
  fresh: BadgeId[];
  signedIn(): boolean;
  go(screen: ScreenId, o?: ShowOptions): void;
  newTerm(): void;
  answer(choice: number): void;
  /** A timeout and a stop function that end with the current screen. */
  later(fn: () => void, ms: number): void;
  track(stop: () => void): void;
  shake(el: HTMLElement): void;
  celebrate(): void;
  openBadges(): void;
  maybeTutorial(): void;
}

export const reduced = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const label = (id: StatId): string => l(STATS.find((x) => x.id === id)?.label);
export const signed = (n: number): string => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;

export function chip(text: string, icon?: string, cls = ''): HTMLElement {
  return h('span', { class: `gm-chip ${cls}`.trim() }, icon ? svg(icon) : null, text);
}

/** The five stats as compact tiles in one row. */
export function hud(st: Readonly<Stats>): HTMLElement {
  return h('div', { class: 'gm-hud' }, ...STATS.map(({ id }) =>
    h('div', { class: `gm-m k-${id}`, title: label(id), role: 'img', 'aria-label': `${label(id)}: ${st[id]}` },
      h('span', { class: 'r', 'aria-hidden': 'true' }, svg(STAT_ICON[id]), h('b', { class: 'num' }, String(st[id]))),
      h('span', { class: 'gm-bar', 'aria-hidden': 'true' }, h('i', { style: `width:${st[id]}%` })))));
}

/**
 * The five stats as rows; with `prev`, bars slide and numbers count from the old values and the change
 * pops in. `fromTo` writes « 25 → 48 » (final report).
 */
export function meterList(c: Ctx, st: Readonly<Stats>, prev?: Readonly<Stats>, fromTo = false): HTMLElement {
  const rows = STATS.map(({ id }, k) => {
    const from = prev ? prev[id] : st[id];
    const d = st[id] - from;
    const bar = h('i', { style: `width:${from}%` });
    const val = h('b', { class: 'num' }, String(fromTo ? st[id] : from));
    if (prev && !fromTo) c.track(tween(val, from, st[id], 900, String));
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = `${st[id]}%`; }));
    return h('div', { class: `gm-lm k-${id}`, role: 'listitem', 'aria-label': `${label(id)}: ${st[id]}${d ? ` (${signed(d)})` : ''}` },
      h('span', { class: 'gm-well', 'aria-hidden': 'true' }, svg(STAT_ICON[id])),
      h('span', { class: 'nm', 'aria-hidden': 'true' }, h('span', null, label(id)), h('span', { class: 'gm-bar' }, bar)),
      fromTo ? h('span', { class: 'gm-ft num', 'aria-hidden': 'true' }, `${from} → `, val) : h('span', { 'aria-hidden': 'true' }, val),
      d ? h('span', { class: `gm-delta ${d > 0 ? 'up' : 'dn'}`, style: `--i:${k}`, 'aria-hidden': 'true' }, signed(d)) : h('span', { 'aria-hidden': 'true' }));
  });
  return h('div', { class: 'gm-list', role: 'list' }, ...rows);
}

/** An adviser's portrait and speech bubble. */
export function adviser(id: AdviserId, small: string, ...content: (Node | string | null)[]): HTMLElement {
  return h('div', { class: 'gm-adv' },
    h('span', { class: 'gm-ava', html: avatarSVG(id) }),
    h('div', { class: 'gm-bub' }, h('small', null, small), ...content));
}
export const adviserName = (id: AdviserId, role?: string): string => `${ADVISERS[id].name} · ${role ?? l(ADVISERS[id].role)}`;

export function mapAria(st: Readonly<Stats>): string {
  return fmt(S().pres.mapAria, { s: st.security, e: st.economy, l: st.social });
}
/** The map of Haiti in its navy panel, with the legend under it unless `bare`. */
export function mapBox(st: Readonly<Stats>, o: Omit<MapOptions, 'aria'> & { bare?: boolean; float?: boolean } = {}): HTMLElement {
  const s = S().pres;
  const box = h('div', { class: `gm-mapbox${o.float ? ' gm-float' : ''}` }, h('div', { class: 'gm-map', html: mapSVG(st, { ...o, aria: mapAria(st) }) }));
  if (!o.bare) {
    box.append(h('div', { class: 'gm-legend', 'aria-hidden': 'true' },
      h('span', null, h('i', { class: 'lg-road' }), s.legendRoads),
      h('span', null, h('i', { class: 'lg-glow' }), s.legendLights),
      h('span', null, h('i', { class: 'lg-school' }), s.legendSchools)));
  }
  return box;
}
/** Redraws a map box for new stats (the roads, lights and schools change with a transition). */
export function redrawMap(box: HTMLElement, st: Readonly<Stats>, o: Omit<MapOptions, 'aria'> = {}): void {
  const m = box.querySelector('.gm-map');
  if (m) m.innerHTML = mapSVG(st, { ...o, aria: mapAria(st) });
}

/** Three stars, `n` of them filled; `pop` makes them land one by one. */
export function stars(n: number, cls = '', pop = false): HTMLElement {
  return h('span', { class: `gm-stars ${cls}`.trim(), role: 'img', 'aria-label': fmt(S().pres.starsOf, { n }) },
    ...[0, 1, 2].map((i) => h('span', { class: i < n ? `on${pop ? ' pop' : ''}` : '', style: pop ? `animation-delay:${0.3 + i * 0.35}s` : undefined, html: GI.star })));
}

export function primary(text: string, onclick: () => void, icon?: string, cls = ''): HTMLButtonElement {
  return h('button', { class: `btn btn-primary gm-btn ${cls}`.trim(), type: 'button', onclick }, text, icon ? svg(icon) : null);
}
export function secondary(text: string, onclick: () => void, icon?: string): HTMLButtonElement {
  return h('button', { class: 'btn gm-btn gm-line', type: 'button', onclick }, icon ? svg(icon) : null, text);
}
export function ghost(text: string, onclick: () => void): HTMLButtonElement {
  return h('button', { class: 'gm-ghost', type: 'button', onclick }, svg(GI.back), text);
}
