import type { Poll, PollResults, Results, StorageAdapter, Vote } from '../types';
import { cleanReason } from '../lib/util';

// Demo mode: everything lives in this browser's localStorage. Nothing leaves the device.
const K = { uid: 'ppm.demo.uid', votes: 'ppm.demo.votes', polls: 'ppm.demo.polls', pollVotes: 'ppm.demo.pollVotes' } as const;

type StoredVote = Vote & { updatedAt: number };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota or private mode */ }
}

const DEMO_POLL: Poll = {
  id: 'demo-2026-w44',
  week: '2026-W44',
  question: {
    ht: 'Nan 100 premye jou yo, ki sa nouvo prezidan an ta dwe fè an premye?',
    fr: 'Dans les 100 premiers jours, que devrait faire le nouveau président en premier ?',
    en: 'In the first 100 days, what should the new president do first?',
  },
  options: [
    { id: 'security', label: { ht: 'Retabli sekirite nan Pòtoprens', fr: 'Rétablir la sécurité à Port-au-Prince', en: 'Restore security in Port-au-Prince' } },
    { id: 'schools', label: { ht: 'Relouvri lekòl ki fèmen yo', fr: 'Rouvrir les écoles fermées', en: 'Reopen closed schools' } },
    { id: 'utilities', label: { ht: 'Yon plan ijans pou kouran ak dlo', fr: 'Un plan d’urgence pour l’électricité et l’eau', en: 'An emergency plan for electricity and water' } },
    { id: 'unity', label: { ht: 'Yon gouvènman inite nasyonal', fr: 'Un gouvernement d’unité nationale', en: 'A national unity government' } },
  ],
  startsAt: Date.parse('2026-10-26T00:00:00-04:00'),
  endsAt: Date.parse('2026-11-01T23:59:59-04:00'),
  active: true,
};

export function createLocalStorage(): StorageAdapter {
  let uid = read<string | null>(K.uid, null);
  if (!uid) {
    uid = `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    write(K.uid, uid);
  }
  const me = uid;
  const voteListeners = new Set<() => void>();
  const pollListeners = new Set<() => void>();
  window.addEventListener('storage', () => { voteListeners.forEach((f) => f()); pollListeners.forEach((f) => f()); });

  const votes = (): Record<string, StoredVote> => read(K.votes, {});
  const pollVotes = (): Record<string, { pollId: string; option: string }> => read(K.pollVotes, {});
  const polls = (): Poll[] => { const p = read<Poll[] | null>(K.polls, null); if (p) return p; write(K.polls, [DEMO_POLL]); return [DEMO_POLL]; };

  function aggregate(): Results {
    const all = Object.values(votes());
    const counts: Record<string, number> = {};
    for (const v of all) counts[v.candidate] = (counts[v.candidate] ?? 0) + 1;
    const reasons = all
      .filter((v) => v.reason)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 12)
      .map((v) => ({ text: v.reason, department: v.department, at: v.updatedAt }));
    return { total: all.length, counts, reasons, updatedAt: Date.now() };
  }

  return {
    mode: 'local',
    async ready() { /* nothing to do */ },
    async getMyVote() { return votes()[me] ?? null; },
    async saveVote(vote) {
      const all = votes();
      all[me] = { ...vote, reason: cleanReason(vote.reason), updatedAt: Date.now() };
      write(K.votes, all);
      voteListeners.forEach((f) => f());
    },
    subscribeVotes(cb) {
      const fire = () => cb(aggregate());
      voteListeners.add(fire);
      fire();
      return () => voteListeners.delete(fire);
    },
    async getActivePoll() { return polls().find((p) => p.active) ?? null; },
    async getPastPolls(limit = 5) { return polls().filter((p) => !p.active).sort((a, b) => b.startsAt - a.startsAt).slice(0, limit); },
    async getMyPollAnswer(pollId) { return pollVotes()[`${pollId}_${me}`]?.option ?? null; },
    async savePollAnswer(pollId, optionId) {
      const all = pollVotes();
      all[`${pollId}_${me}`] = { pollId, option: optionId };
      write(K.pollVotes, all);
      pollListeners.forEach((f) => f());
    },
    subscribePollResults(pollId, cb) {
      const fire = () => {
        const counts: Record<string, number> = {};
        let total = 0;
        for (const v of Object.values(pollVotes())) if (v.pollId === pollId) { counts[v.option] = (counts[v.option] ?? 0) + 1; total++; }
        cb({ total, counts } satisfies PollResults);
      };
      pollListeners.add(fire);
      fire();
      return () => pollListeners.delete(fire);
    },
  };
}
