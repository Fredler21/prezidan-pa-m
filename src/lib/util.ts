import type { Candidate, PriorityId } from '../types';

/** Fisher-Yates; a new order on every page load (neutrality rule). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export interface Matched {
  candidate: Candidate;
  matched: PriorityId[];
}

/**
 * Ranks candidates by how many of the visitor's priorities they have a public record on.
 * Candidates with no published platform (no tags) go to the second list, untouched.
 * Ties keep the (random) incoming order.
 */
export function matchCandidates(candidates: readonly Candidate[], picks: readonly PriorityId[]): { ranked: Matched[]; unpublished: Candidate[] } {
  const ranked: Matched[] = [];
  const unpublished: Candidate[] = [];
  for (const c of candidates) {
    if (c.tags.length === 0) { unpublished.push(c); continue; }
    const tagIds = new Set(c.tags.map((t) => t.id));
    ranked.push({ candidate: c, matched: picks.filter((p) => tagIds.has(p)) });
  }
  ranked.sort((a, b) => b.matched.length - a.matched.length);
  return { ranked, unpublished };
}

export const REASON_MAX = 240;

/** Strips URLs and anything that looks like a link, collapses whitespace, caps at 240 chars. */
export function cleanReason(input: string): string {
  return input
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|ht|io|co|info)\b\S*/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, REASON_MAX);
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

/** Deterministic hue in a shared blue/indigo range (215-250) so no avatar reads as a party color. */
export function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const hue = 215 + (hash % 36);
  return `hsl(${hue} 55% 24%)`;
}

export function siteUrl(hash = ''): string {
  const base = `${location.origin}${location.pathname}`;
  return hash ? `${base}#${hash}` : base;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch { return false; }
  }
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

/** Whole days from today (local midnight) to an ISO date; negative once it has passed. */
export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function isoWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
