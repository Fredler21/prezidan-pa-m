import { LANGS, type Lang, type L10n } from '../types';
import { T, type Strings } from './strings';

const KEY = 'ppm.lang';
const listeners = new Set<(lang: Lang) => void>();
let current: Lang = detectLang();

function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

/**
 * Picks the UI language from the visitor's area, unless they already chose one.
 *  1. A saved choice always wins.
 *  2. Haiti (time zone America/Port-au-Prince) → Kreyòl, whatever the phone language.
 *  3. Browser language: ht → Kreyòl, fr → French, en → English.
 *  4. French-speaking regions (by time zone) → French; otherwise Kreyòl (the default).
 */
export function detectLang(): Lang {
  // ?lang=ht|fr|en in a shared link wins and is remembered.
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLang(fromUrl)) {
    try { localStorage.setItem(KEY, fromUrl); } catch { /* ignore */ }
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage unavailable */ }

  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { /* old browsers */ }
  if (tz === 'America/Port-au-Prince') return 'ht';

  const langs: readonly string[] = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map((l) => l.toLowerCase());
  for (const l of langs) {
    if (l.startsWith('ht')) return 'ht';
  }
  const first = langs[0] ?? '';
  if (first.startsWith('fr')) return 'fr';
  if (first.startsWith('en')) return 'en';

  const frenchZones = /^(Europe\/(Paris|Brussels|Luxembourg|Monaco|Zurich|Geneva)|America\/(Montreal|Toronto|Cayenne|Guadeloupe|Martinique|St_Barthelemy|Marigot)|Africa\/(Dakar|Abidjan|Kinshasa|Douala|Bamako|Ouagadougou|Niamey|Conakry|Lome|Porto-Novo|Brazzaville|Bangui|Ndjamena|Libreville|Algiers|Tunis|Casablanca)|Indian\/(Reunion|Mayotte)|Pacific\/(Noumea|Tahiti))$/;
  if (frenchZones.test(tz)) return 'fr';
  const englishZones = /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Nassau|Jamaica)|Europe\/(London|Dublin)|Australia\/|Pacific\/Honolulu)/;
  if (englishZones.test(tz)) return 'en';
  return 'ht';
}

export function getLang(): Lang { return current; }

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  for (const fn of listeners) fn(lang);
}

export function onLangChange(fn: (lang: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Strings for the current language. */
export function S(): Strings { return T[current]; }

/** Interpolates {name} placeholders. */
export function fmt(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? ''));
}

/** Localized value from an {ht, fr, en} record, with fallbacks. */
export function l(v: L10n | undefined): string {
  if (!v) return '';
  return v[current] || v.ht || v.fr || v.en || '';
}

const LOCALE: Record<Lang, string> = { ht: 'fr-HT', fr: 'fr-FR', en: 'en-US' };

export function fmtNumber(n: number): string {
  try { return new Intl.NumberFormat(LOCALE[current]).format(n); } catch { return String(n); }
}

const MONTHS_HT = ['janvye', 'fevriye', 'mas', 'avril', 'me', 'jen', 'jiyè', 'out', 'septanm', 'oktòb', 'novanm', 'desanm'];

export function fmtDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  if (Number.isNaN(d.getTime())) return iso;
  if (current === 'ht') return `${d.getDate()} ${MONTHS_HT[d.getMonth()]} ${d.getFullYear()}`;
  try { return new Intl.DateTimeFormat(LOCALE[current], { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch { return iso; }
}

export function fmtTime(ms: number): string {
  try { return new Intl.DateTimeFormat(LOCALE[current], { hour: '2-digit', minute: '2-digit' }).format(new Date(ms)); } catch { return ''; }
}

export function timeAgo(ms: number): string {
  const s = S().results;
  const diff = Math.max(0, Date.now() - ms);
  const m = Math.floor(diff / 60000);
  if (m < 1) return s.justNow;
  if (m < 60) return fmt(s.minutesAgo, { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return fmt(s.hoursAgo, { n: h });
  return fmt(s.daysAgo, { n: Math.floor(h / 24) });
}

document.documentElement.lang = current;
