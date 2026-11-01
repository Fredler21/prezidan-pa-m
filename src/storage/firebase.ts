import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp, onSnapshot, collection, query, where, orderBy, limit,
  getDocs, getCountFromServer, type Firestore, type DocumentData, type Timestamp,
} from 'firebase/firestore';
import type { Poll, PollResults, Results, StorageAdapter, Vote, DepartmentId } from '../types';
import { content } from '../content';
import { cleanReason } from '../lib/util';
import { app, ensureUser, currentUid } from './auth';

/*
 * Firestore layout (see firestore.rules):
 *   votes/{uid}              one vote per signed-in user
 *   polls/{pollId}           weekly polls (admin-written)
 *   pollVotes/{pollId_uid}   one answer per user per poll
 *   stats/presidential       optional aggregate written by Cloud Functions (Blaze plan)
 *   stats/poll_{pollId}      optional aggregate per poll
 * Without Functions, results are computed client-side with count() aggregation queries
 * (cheap: 1 read per 1000 matching docs) and refreshed periodically.
 */
const REFRESH_MS = 45_000;

function db(): Firestore { return getFirestore(app()); }
function ms(ts: unknown): number { return ts && typeof ts === 'object' && 'toMillis' in ts ? (ts as Timestamp).toMillis() : Date.now(); }

function toPoll(id: string, d: DocumentData): Poll {
  return {
    id,
    week: String(d.week ?? ''),
    question: d.question,
    options: Array.isArray(d.options) ? d.options : [],
    startsAt: ms(d.startsAt),
    endsAt: ms(d.endsAt),
    active: Boolean(d.active),
  };
}

export function createFirebaseStorage(): StorageAdapter {
  async function countResults(): Promise<Results> {
    // Read the ids per refresh so candidates published to Firestore later are counted too.
    const ids = content().candidates.map((c) => c.id);
    const votes = collection(db(), 'votes');
    const [totalSnap, ...perCandidate] = await Promise.all([
      getCountFromServer(votes),
      ...ids.map((id) => getCountFromServer(query(votes, where('candidate', '==', id)))),
    ]);
    const counts: Record<string, number> = {};
    ids.forEach((id, i) => { counts[id] = perCandidate[i]?.data().count ?? 0; });
    const latest = await getDocs(query(votes, orderBy('updatedAt', 'desc'), limit(25)));
    const reasons = latest.docs
      .map((s) => s.data())
      .filter((d) => typeof d.reason === 'string' && d.reason.trim().length > 0)
      .slice(0, 12)
      .map((d) => ({ text: cleanReason(String(d.reason)), department: (d.department ?? 'na') as DepartmentId, at: ms(d.updatedAt) }));
    return { total: totalSnap.data().count, counts, reasons, updatedAt: Date.now() };
  }

  return {
    mode: 'firebase',
    async ready() { await ensureUser(); },

    async getMyVote() {
      const uid = await currentUid();
      if (!uid) return null;
      const snap = await getDoc(doc(db(), 'votes', uid));
      if (!snap.exists()) return null;
      const d = snap.data();
      return { candidate: String(d.candidate), reason: String(d.reason ?? ''), department: (d.department ?? 'na') as DepartmentId, priorities: Array.isArray(d.priorities) ? d.priorities : [], lang: d.lang ?? 'ht' };
    },

    async saveVote(vote: Vote) {
      const user = await ensureUser();
      const ref = doc(db(), 'votes', user.uid);
      const existing = await getDoc(ref);
      const data: DocumentData = {
        candidate: vote.candidate,
        reason: cleanReason(vote.reason),
        department: vote.department,
        priorities: vote.priorities.slice(0, 3),
        lang: vote.lang,
        updatedAt: serverTimestamp(),
      };
      if (!existing.exists()) data.createdAt = serverTimestamp();
      await setDoc(ref, data, { merge: true });
    },

    async deleteMyVote() {
      const uid = await currentUid();
      if (uid) await deleteDoc(doc(db(), 'votes', uid));
    },

    subscribeVotes(cb) {
      // Count queries first (fast unary calls), so the page never waits on the realtime
      // stream; the stats/presidential listener takes over whenever Functions maintain it.
      let stopped = false;
      let usingStats = false;
      const refresh = async () => {
        if (stopped || usingStats) return;
        try { const r = await countResults(); if (!stopped && !usingStats) cb(r); } catch (e) { console.warn('results refresh failed', e); }
      };
      void refresh();
      const timer = window.setInterval(refresh, REFRESH_MS);
      const offStats = onSnapshot(doc(db(), 'stats', 'presidential'), (snap) => {
        if (!snap.exists()) return;
        usingStats = true;
        clearInterval(timer);
        const d = snap.data();
        cb({ total: Number(d.total ?? 0), counts: d.counts ?? {}, reasons: Array.isArray(d.reasons) ? d.reasons.map((r: DocumentData) => ({ text: String(r.text ?? ''), department: (r.department ?? 'na') as DepartmentId, at: ms(r.at) })) : [], updatedAt: ms(d.updatedAt) });
      }, (e) => console.warn('stats listener failed', e));
      const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
      document.addEventListener('visibilitychange', onVisible);
      return () => { stopped = true; offStats(); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    },

    async getActivePoll() {
      const q = query(collection(db(), 'polls'), where('active', '==', true), orderBy('startsAt', 'desc'), limit(1));
      const snap = await getDocs(q);
      const first = snap.docs[0];
      return first ? toPoll(first.id, first.data()) : null;
    },
    async getPastPolls(max = 5) {
      const q = query(collection(db(), 'polls'), where('active', '==', false), orderBy('startsAt', 'desc'), limit(max));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toPoll(d.id, d.data()));
    },
    async getMyPollAnswer(pollId) {
      const uid = await currentUid();
      if (!uid) return null;
      const snap = await getDoc(doc(db(), 'pollVotes', `${pollId}_${uid}`));
      return snap.exists() ? String(snap.data().option) : null;
    },
    async savePollAnswer(pollId, optionId) {
      const user = await ensureUser();
      await setDoc(doc(db(), 'pollVotes', `${pollId}_${user.uid}`), { pollId, option: optionId, lang: document.documentElement.lang || 'ht', updatedAt: serverTimestamp() });
    },
    subscribePollResults(pollId, cb) {
      let stopped = false;
      let usingStats = false;
      const refresh = async () => {
        if (stopped || usingStats) return;
        try {
          const snap = await getDocs(query(collection(db(), 'pollVotes'), where('pollId', '==', pollId)));
          const counts: Record<string, number> = {};
          snap.docs.forEach((d) => { const o = String(d.data().option); counts[o] = (counts[o] ?? 0) + 1; });
          if (!stopped && !usingStats) cb({ total: snap.size, counts } satisfies PollResults);
        } catch (e) { console.warn('poll refresh failed', e); }
      };
      void refresh();
      const timer = window.setInterval(refresh, REFRESH_MS);
      const off = onSnapshot(doc(db(), 'stats', `poll_${pollId}`), (snap) => {
        if (!snap.exists()) return;
        usingStats = true;
        clearInterval(timer);
        const d = snap.data();
        cb({ total: Number(d.total ?? 0), counts: d.counts ?? {} });
      }, (e) => console.warn('poll stats listener failed', e));
      return () => { stopped = true; off(); clearInterval(timer); };
    },
  };
}
