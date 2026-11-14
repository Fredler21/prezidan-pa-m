import { l } from '../../i18n';
import { CITIES, COAST, LEVELS, ROADS, type AdviserId, type CityId, type SceneId, type Stats } from '../../data/president-levels.ts';

/*
 * The art of « Si m te prezidan », as inline SVG strings built only from our own data (ported from the
 * prototype): the living map of Haiti, one story scene per level, the advisers' portraits and a few icons.
 * Flat colours only: no gradient, glow or blur. Animations are CSS classes (gm-*), reduced under
 * prefers-reduced-motion in styles.css.
 */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));
const line = (paths: string, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${paths}</svg>`;

export const GI = {
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.3 1.05 6.1L12 16.8l-5.5 2.9 1.05-6.1L3.1 9.3l6.15-.9z"/></svg>',
  sound: line('<path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16.5 8.5a5 5 0 010 7"/><path d="M19 6a8.5 8.5 0 010 12"/>'),
  mute: line('<path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>'),
  medal: line('<circle cx="12" cy="15" r="5"/><path d="M8.6 11.2L6 3h4l2 5 2-5h4l-2.6 8.2"/><path d="M12 13v4"/>'),
  pen: line('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  road: line('<path d="M5 20L9 4h6l4 16"/><path d="M12 7v2.5M12 12.5v2.5M12 18v2"/>'),
  crane: line('<path d="M6 21V5h12"/><path d="M6 5l4 4"/><path d="M18 5v5"/><rect x="15" y="10" width="6" height="4" rx="1"/><path d="M3 21h7"/>'),
  book: line('<path d="M12 5.5C10 4 7 4 4 5v13c3-1 6-1 8 .5 2-1.5 5-1.5 8-.5V5c-3-1-6-1-8 .5z"/><path d="M12 5.5v13"/>'),
  heart: line('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
  bank: line('<path d="M3 9.5L12 4l9 5.5"/><path d="M5 10v8M9.7 10v8M14.3 10v8M19 10v8"/><path d="M3 20h18"/>'),
  shield: line('<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/>'),
  bars: line('<path d="M4 20h16"/><path d="M6 16V9M12 16V5M18 16v-4"/>'),
  cyclone: line('<path d="M12 4c-4.5 0-8 2.6-8 6.5"/><path d="M12 20c4.5 0 8-2.6 8-6.5"/><circle cx="12" cy="12" r="3"/><path d="M4 10.5c0 2.2 1.4 3.6 3.6 4.3"/><path d="M20 13.5c0-2.2-1.4-3.6-3.6-4.3"/>'),
  ballot: line('<path d="M4 13h16v7H4z"/><path d="M8 13V5h8v8"/><path d="M10 8.5l1.5 1.5L14.5 7"/>'),
  ribbon: line('<circle cx="12" cy="9" r="6"/><path d="M8.6 13.8L7 21l5-3 5 3-1.6-7.2"/>'),
  flame: line('<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.6 1.8 1.6 2.8 2.7 3.3.3-2.6 1.4-4.7 3.4-6.3-.2 3 1 5 2.3 6.8.9 1.3 1.5 2.7 1.5 4.5 0 3.6-2.6 6.2-7 6.2z"/>'),
  idea: line('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 00-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0012 3z"/>'),
  history: line('<path d="M3.5 12a8.5 8.5 0 102.6-6.1"/><path d="M3 4v4.5h4.5"/><path d="M12 8v4l3 2"/>'),
  copy: line('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>'),
  play: line('<path d="M8 5.5v13l10.5-6.5z"/>'),
  back: line('<path d="M15 6l-6 6 6 6"/>'),
  trophy: line('<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4"/><path d="M12 13v4M9 20h6"/>'),
  lock: line('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
};

/** Icons for the five stats and the eleven badges. */
export const STAT_ICON: Record<keyof Stats, string> = { security: GI.shield, economy: GI.bars, social: GI.book, trust: GI.heart, treasury: GI.bank };
export const BADGE_ICON: Record<string, string> = {
  first: GI.pen, road: GI.road, build: GI.crane, teach: GI.book, people: GI.heart, thrift: GI.bank,
  star3: GI.star, storm: GI.cyclone, remit: GI.ballot, full: GI.ribbon, streak: GI.flame,
};

// ---- the map of Haiti ----
const K = 118;
const X = (lon: number) => +((lon + 74.6) * K).toFixed(1);
const Y = (lat: number) => +((20.12 - lat) * K).toFixed(1);
const pt = (p: CityId | readonly [number, number]): [number, number] => (typeof p === 'string' ? [CITIES[p].lon, CITIES[p].lat] : [p[0], p[1]]);
const pts = (list: readonly (CityId | readonly [number, number])[]) => list.map((p) => { const [lo, la] = pt(p); return `${X(lo)},${Y(la)}`; }).join(' ');
const CITY_ORDER = Object.keys(CITIES) as CityId[];
const starShape = (cx: number, cy: number, r: number) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
};

export interface MapLevels { year: number; done: boolean; stars: readonly number[]; labelOf: (i: number, state: 'done' | 'cur' | 'lock') => string }
export interface MapOptions { labels?: boolean; storm?: boolean; levels?: MapLevels; aria: string }

/** Roads show security, the town discs the economy, the green squares the schools; levels add the term's path. */
export function mapSVG(st: Readonly<Stats>, o: MapOptions): string {
  const road = st.security < 35 ? 'blocked' : st.security < 55 ? 'risky' : 'open';
  const schools = Math.min(8, Math.floor(st.social / 12));
  let s = `<svg viewBox="0 0 360 262" role="img" aria-label="${esc(o.aria)}">`;
  // a quiet chart: half-degree graticule, a compass, and the land lifted off the sea by a darker edge
  for (let lon = -74.5; lon <= -71.5; lon += 0.5) s += `<line class="gm-grid" x1="${X(lon)}" y1="0" x2="${X(lon)}" y2="262"/>`;
  for (let lat = 18; lat <= 20; lat += 0.5) s += `<line class="gm-grid" x1="0" y1="${Y(lat)}" x2="360" y2="${Y(lat)}"/>`;
  s += '<g class="gm-compass" transform="translate(24 26)"><circle r="10"/><path d="M0 -7l3 7h-6z" class="n"/><path d="M0 7l3 -7h-6z"/></g>';
  s += `<polygon class="gm-relief" points="${pts(COAST)}" transform="translate(0 4)"/><polygon class="gm-land" points="${pts(COAST)}"/>`;
  s += `<ellipse class="gm-land" cx="${X(-73.05)}" cy="${Y(18.83)}" rx="32" ry="8" transform="rotate(20 ${X(-73.05)} ${Y(18.83)})"/>`;
  s += ROADS.map((r) => `<polyline class="gm-road ${road}" points="${pts(r)}"/>`).join('');
  CITY_ORDER.forEach((k, i) => {
    const c = CITIES[k];
    const x = X(c.lon), y = Y(c.lat);
    s += `<circle class="gm-glow" cx="${x}" cy="${y}" r="${(4 + st.economy / 7).toFixed(1)}" opacity="${(st.economy / 260).toFixed(2)}"/><circle class="gm-town" cx="${x}" cy="${y}" r="2.6"/>`;
    if (i < schools) s += `<rect class="gm-school" x="${x + 5}" y="${y - 10}" width="7" height="7" rx="1.5" style="animation-delay:${(i * 0.08).toFixed(2)}s"/>`;
    if (o.labels && !o.levels) {
      const anchor = k === 'hin' || k === 'okp' ? 'end' : 'start';
      const dx = k === 'jer' || k === 'oka' ? -4 : anchor === 'end' ? -6 : 6;
      s += `<text class="gm-maplabel" x="${x + dx}" y="${y + 12}" text-anchor="${anchor}">${esc(l(c.name))}</text>`;
    }
  });
  if (o.storm) {
    const cx = X(-73.9), cy = Y(18.3);
    s += `<g class="gm-spin"><circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#DFE6FF" stroke-width="5" stroke-dasharray="26 14" opacity=".75"/><circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#DFE6FF" stroke-width="4" stroke-dasharray="12 8" opacity=".75"/></g>`;
  }
  if (o.levels) {
    const lv = o.levels;
    s += `<polyline class="gm-trail" points="${pts(LEVELS.map((x) => x.city))}"/>`;
    LEVELS.forEach((level, i) => {
      const c = CITIES[level.city];
      const x = X(c.lon), y = Y(c.lat);
      const state: 'done' | 'cur' | 'lock' = lv.done || i < lv.year ? 'done' : i === lv.year ? 'cur' : 'lock';
      const n = lv.stars[i] ?? 0;
      s += `<g class="gm-node ${state}" data-y="${i}" tabindex="0" role="button" aria-label="${esc(lv.labelOf(i, state))}">`;
      if (state === 'cur') s += `<circle class="pulse" cx="${x}" cy="${y}" r="17"/>`;
      s += `<circle class="n" cx="${x}" cy="${y}" r="16"/>`;
      s += state === 'lock'
        ? `<g transform="translate(${x - 6} ${y - 7}) scale(.5)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></g>`
        : `<text class="num" x="${x}" y="${y + 4.5}">${i + 1}</text>`;
      // labels sit where they do not collide: right of Okap, left of Gonayiv, under the others
      s += level.city === 'okp' ? `<text class="ct" style="text-anchor:start" x="${x + 21}" y="${y + 3}">${esc(l(level.name))}</text>`
        : level.city === 'gon' ? `<text class="ct" style="text-anchor:end" x="${x - 21}" y="${y + 3}">${esc(l(level.name))}</text>`
        : `<text class="ct" x="${x}" y="${y + 28}">${esc(l(level.name))}</text>`;
      if (state === 'done' && n) s += [0, 1, 2].map((k) => `<polygon class="${k < n ? 'st on' : 'st'}" points="${starShape(x - 12 + k * 12, y - 23, 5)}"/>`).join('');
      s += '</g>';
    });
  }
  return `${s}</svg>`;
}

// ---- story scenes (360 x 140) ----
const flag = (x: number, y: number) =>
  `<rect x="${x}" y="${y}" width="2" height="34" fill="#DDD"/><g class="gm-wave"><rect x="${x + 2}" y="${y}" width="22" height="7" fill="#2447D6"/><rect x="${x + 2}" y="${y + 7}" width="22" height="7" fill="#E8405A"/></g>`;

export function sceneSVG(t: SceneId, label: string): string {
  const dark = t === 'stm';
  const band = { sec: '#E58A5C', eko: '#2C4A96', lek: '#E58A5C', stm: '#262D45', vot: '#2C4A96' }[t];
  const back = `<rect width="360" height="140" fill="${dark ? '#141A2E' : '#1B2F7A'}"/><rect y="48" width="360" height="56" fill="${band}"/>`
    + '<g fill="#FFFFFF" opacity=".4"><circle cx="28" cy="14" r="1"/><circle cx="74" cy="30" r=".8"/><circle cx="131" cy="11" r="1"/><circle cx="186" cy="26" r=".8"/><circle cx="232" cy="12" r="1"/><circle cx="322" cy="20" r=".8"/><circle cx="344" cy="36" r="1"/></g>'
    + (dark ? '' : '<circle cx="290" cy="56" r="18" fill="#FFD27A"/>')
    + `<path d="M0 92l50-34 46 26 52-40 60 44 54-30 98 40v42H0z" fill="${dark ? '#20283F' : '#27407F'}"/><path d="M0 104l70-22 80 20 90-26 120 30v34H0z" fill="${dark ? '#1A2A2A' : '#1D5148'}"/>`;
  const art: Record<SceneId, string> = {
    sec: `<path d="M130 140l34-44h32l34 44z" fill="#2B2F3D"/><path d="M180 100v8m0 8v10" stroke="#F6C445" stroke-width="2" stroke-dasharray="6 6"/>
      <rect x="120" y="108" width="120" height="9" fill="#F6C445"/><path d="M130 108l9 9m10-9l9 9m10-9l9 9m10-9l9 9m10-9l9 9m10-9l9 9" stroke="#111" stroke-width="4"/><rect x="128" y="117" width="5" height="14" fill="#999"/><rect x="227" y="117" width="5" height="14" fill="#999"/>
      <circle cx="104" cy="126" r="8" fill="none" stroke="#111" stroke-width="5"/><circle cx="256" cy="128" r="8" fill="none" stroke="#111" stroke-width="5"/><path d="M252 112q4-14 8 0z" fill="#FF8A3D" class="gm-blink"/>
      <rect x="34" y="108" width="50" height="16" rx="4" fill="#E9EDF8"/><rect x="42" y="100" width="30" height="10" rx="3" fill="#9FB4E8"/><circle cx="46" cy="126" r="5" fill="#111"/><circle cx="74" cy="126" r="5" fill="#111"/><rect x="52" y="95" width="10" height="5" fill="#E8405A" class="gm-blink"/>`,
    eko: `<rect y="106" width="360" height="34" fill="#12306E"/><path d="M0 112q15-5 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0" stroke="#5F8CFF" fill="none" opacity=".6"/>
      <g class="gm-bob"><path d="M40 104h110l-12 20H52z" fill="#B93A4E"/><rect x="62" y="88" width="16" height="16" fill="#F6C445"/><rect x="80" y="88" width="16" height="16" fill="#36CC8C"/><rect x="98" y="88" width="16" height="16" fill="#3B66FF"/><rect x="122" y="80" width="12" height="24" fill="#EEE"/></g>
      <rect x="200" y="100" width="160" height="40" fill="#3A4466"/><path d="M230 100V44h56M230 44l-18 20M286 44v26" stroke="#F6C445" stroke-width="4" fill="none"/><rect x="278" y="70" width="16" height="12" fill="#E8405A" class="gm-hop"/>
      <rect x="300" y="84" width="18" height="16" fill="#36CC8C"/><rect x="320" y="84" width="18" height="16" fill="#3B66FF"/><rect x="310" y="68" width="18" height="16" fill="#F6C445"/>`,
    lek: `<rect x="110" y="66" width="140" height="62" fill="#F1E2BD"/><path d="M100 68l80-30 80 30z" fill="#B93A4E"/><rect x="170" y="96" width="20" height="32" fill="#7A4A2B"/>
      <rect x="124" y="82" width="24" height="18" fill="#7FB2FF"/><rect x="212" y="82" width="24" height="18" fill="#7FB2FF"/><text x="180" y="62" text-anchor="middle" font-size="9" font-weight="700" fill="#FFF">LEKÒL NASYONAL</text>
      ${flag(268, 60)}
      <g class="gm-hop"><circle cx="70" cy="112" r="6" fill="#8D5A3B"/><rect x="65" y="118" width="10" height="13" rx="2" fill="#3B66FF"/></g><g class="gm-hop" style="animation-delay:.3s"><circle cx="90" cy="114" r="5" fill="#7B4B30"/><rect x="86" y="119" width="8" height="12" rx="2" fill="#F6C445"/></g>
      <rect x="300" y="100" width="40" height="28" fill="#FFF"/><path d="M320 106v16m-8-8h16" stroke="#E8405A" stroke-width="5"/>`,
    stm: `<g class="gm-spin"><circle cx="270" cy="38" r="26" fill="none" stroke="#C9D3FF" stroke-width="6" stroke-dasharray="30 14" opacity=".8"/><circle cx="270" cy="38" r="12" fill="none" stroke="#C9D3FF" stroke-width="4" stroke-dasharray="14 8" opacity=".8"/></g>
      <g class="gm-sway"><path d="M92 132q-4-34 2-58" stroke="#5B3D24" stroke-width="6" fill="none"/><path d="M94 74q-26-10-40 6m40-6q-20-22-44-14m44 14q4-24 30-22m-30 22q22-8 36 8" stroke="#2F8F63" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <g class="gm-sway" style="animation-delay:.25s"><path d="M176 134q-3-26 2-44" stroke="#5B3D24" stroke-width="5" fill="none"/><path d="M178 90q-22-8-32 6m32-6q-16-18-36-10m36 10q4-20 24-18m-24 18q18-6 30 6" stroke="#2F8F63" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <rect x="226" y="108" width="54" height="24" fill="#8A7A66"/><path d="M220 110l33-18 33 18z" fill="#6B3140" class="gm-hop"/>
      <g class="gm-rain" stroke="#B8C8FF" stroke-width="1.5" opacity=".7">${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 15 + ((i * 37) % 11)} ${((i * 29) % 120) - 20}l-7 14"/>`).join('')}</g>`,
    vot: `${flag(60, 58)}<rect x="140" y="82" width="80" height="50" rx="4" fill="#EEF1FB"/><rect x="160" y="80" width="40" height="5" fill="#111"/><text x="180" y="114" text-anchor="middle" font-size="13" font-weight="800" fill="#2447D6">VÒT</text>
      <rect x="170" y="52" width="20" height="26" fill="#FFF" stroke="#999" class="gm-drop"/>
      ${[250, 272, 294, 316].map((x, i) => `<g class="gm-hop" style="animation-delay:${i * 0.2}s"><circle cx="${x}" cy="${104 + (i % 2) * 3}" r="6" fill="${['#8D5A3B', '#7B4B30', '#A66A45', '#6E422A'][i]}"/><rect x="${x - 6}" y="${110 + (i % 2) * 3}" width="12" height="20" rx="3" fill="${['#E8405A', '#F6C445', '#36CC8C', '#3B66FF'][i]}"/></g>`).join('')}`,
  };
  return `<svg viewBox="0 0 360 140" role="img" aria-label="${esc(label)}">${back}${art[t]}</svg>`;
}

// ---- advisers: flat geometric portraits ----
export function avatarSVG(k: AdviserId): string {
  const c = { kom: ['#274690', '#8D5A3B'], vik: ['#7A2E52', '#A66A45'], mir: ['#1F6F63', '#7B4B30'], tij: ['#8A5A12', '#9A623F'] }[k];
  const extra = {
    kom: '<path d="M12 17q12-12 24 0v3H12z" fill="#16264F"/><rect x="21" y="12" width="6" height="4" rx="1" fill="#F6C445"/>',
    vik: '<path d="M11 24q0-16 13-16t13 16q-3-9-13-9t-13 9z" fill="#1A1210"/><circle cx="19.5" cy="23" r="3.6" fill="none" stroke="#F6C445" stroke-width="1.2"/><circle cx="28.5" cy="23" r="3.6" fill="none" stroke="#F6C445" stroke-width="1.2"/>',
    mir: '<path d="M12 22q0-13 12-13t12 13q-4-7-12-7t-12 7z" fill="#1A1210"/><path d="M17 38q7 7 14 0" fill="none" stroke="#CFD8FF" stroke-width="2"/>',
    tij: '<ellipse cx="24" cy="15" rx="16" ry="4" fill="#E3C27A"/><path d="M15 15q9-12 18 0z" fill="#D1AD5E"/>',
  }[k];
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="${c[0]}"/><path d="M6 50q0-14 18-14t18 14z" fill="#EEF1FB" opacity=".9"/><circle cx="24" cy="23" r="10" fill="${c[1]}"/>${extra}<circle cx="20" cy="23" r="1.3" fill="#111"/><circle cx="28" cy="23" r="1.3" fill="#111"/><path d="M20 28q4 3 8 0" fill="none" stroke="#111" stroke-width="1.3" stroke-linecap="round"/></svg>`;
}
