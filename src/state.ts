import type { PriorityId, Vote } from './types';
import { MAX_PICKS } from './data/priorities';

const KEY = 'ppm.picks';
const listeners = new Set<() => void>();

function load(): PriorityId[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as PriorityId[]).slice(0, MAX_PICKS) : [];
  } catch { return []; }
}

export const state = {
  picks: load(),
  myVote: null as Vote | null,
  /** true once the load reveal has played; later renders must not animate. */
  revealed: false,
};

export function togglePick(id: PriorityId): boolean {
  const i = state.picks.indexOf(id);
  if (i >= 0) state.picks.splice(i, 1);
  else if (state.picks.length < MAX_PICKS) state.picks.push(id);
  else return false;
  try { localStorage.setItem(KEY, JSON.stringify(state.picks)); } catch { /* ignore */ }
  emit();
  return true;
}

export function setMyVote(v: Vote | null): void { state.myVote = v; emit(); }

export function onState(fn: () => void): () => void { listeners.add(fn); return () => listeners.delete(fn); }
function emit(): void { for (const fn of listeners) fn(); }
