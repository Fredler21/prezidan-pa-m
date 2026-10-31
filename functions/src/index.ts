/*
 * Prezidan Pa M — Cloud Functions (optional, Blaze plan).
 *
 * The site works without these: clients compute results with count() queries.
 * Once deployed, every vote write refreshes `stats/presidential` (and every poll
 * answer refreshes `stats/poll_{pollId}`), and clients switch to a single realtime
 * listener on those documents — far cheaper at scale.
 *
 * Reasons are re-sanitized here (URLs stripped, 240 chars) before being published
 * in the aggregate, so the public feed never depends on client-side cleaning alone.
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();
setGlobalOptions({ region: 'us-east1', maxInstances: 5 });
const db = getFirestore();

const CANDIDATES = [
  'martelly', 'claude-joseph', 'privert', 'bodeau', 'jeudy', 'muscadin', 'maxo-joseph', 'ricardo-jean-pierre',
  'wilner-joseph', 'mourra', 'dorfeuille', 'deronneth', 'adrien', 'durocher', 'gue', 'st-fort', 'salomon', 'tardieu', 'barrau',
];

function cleanReason(input: unknown): string {
  return String(input ?? '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\b[a-z0-9-]+\.(com|net|org|ht|io|co|info)\b\S*/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

async function rebuildPresidential(): Promise<void> {
  const votes = db.collection('votes');
  const [total, ...per] = await Promise.all([
    votes.count().get(),
    ...CANDIDATES.map((id) => votes.where('candidate', '==', id).count().get()),
  ]);
  const counts: Record<string, number> = {};
  CANDIDATES.forEach((id, i) => { counts[id] = per[i]?.data().count ?? 0; });
  const latest = await votes.orderBy('updatedAt', 'desc').limit(40).get();
  const reasons = latest.docs
    .map((d) => d.data())
    .map((d) => ({ text: cleanReason(d.reason), department: typeof d.department === 'string' ? d.department : 'na', at: d.updatedAt instanceof Timestamp ? d.updatedAt : Timestamp.now() }))
    .filter((r) => r.text.length > 0)
    .slice(0, 12);
  await db.doc('stats/presidential').set({ total: total.data().count, counts, reasons, updatedAt: FieldValue.serverTimestamp() });
}

export const onVoteWritten = onDocumentWritten('votes/{uid}', async () => {
  await rebuildPresidential();
});

export const onPollAnswerWritten = onDocumentWritten('pollVotes/{answerId}', async (event) => {
  const pollId = String(event.params.answerId).split('_')[0];
  if (!pollId) return;
  const answers = await db.collection('pollVotes').where('pollId', '==', pollId).get();
  const counts: Record<string, number> = {};
  answers.docs.forEach((d) => { const o = String(d.data().option ?? ''); if (o) counts[o] = (counts[o] ?? 0) + 1; });
  await db.doc(`stats/poll_${pollId}`).set({ total: answers.size, counts, updatedAt: FieldValue.serverTimestamp() });
});
