import type { PriorityId, StorageAdapter, Vote } from './types';
import { LANGS } from './types';
import { state, onState, setPicks, setMyVote } from './state';
import { getLang } from './i18n';
import { getStorage, STORAGE_MODE } from './storage';
import { bestScore, gameResult, gameRun, saveGameResult, saveGameRun, type GameResult, type GameRun } from './lib/progress';

/*
 * Accounts are optional: voting works anonymously. Signing in (Google, or email + password)
 * saves the visitor's progress, their priorities, their vote and their « Si m te prezidan » game
 * (the unfinished term, the last result, the best score), under users/{uid} and votes/{uid}, so it
 * follows them across devices.
 *
 * A small flag in localStorage ('ppm.account') lets the header show the signed-in state on
 * every page without loading the Firebase SDK; the SDK itself loads only when needed.
 */

export interface Account { name: string; email: string; photo: string | null }
const KEY = 'ppm.account';
const listeners = new Set<(a: Account | null) => void>();

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch { return null; }
}

function setAccount(a: Account | null): void {
  try { if (a) localStorage.setItem(KEY, JSON.stringify(a)); else localStorage.removeItem(KEY); } catch { /* ignore */ }
  for (const fn of listeners) fn(a);
}

export function onAccountChange(fn: (a: Account | null) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

type FirebaseUser = { uid: string; isAnonymous: boolean; displayName: string | null; email: string | null; photoURL: string | null };

function toAccount(u: FirebaseUser): Account {
  return { name: u.displayName || (u.email ? u.email.split('@')[0] ?? '' : ''), email: u.email ?? '', photo: u.photoURL };
}

interface CloudGame { run: GameRun | null; last: GameResult | null; best: number }
async function progressDoc(uid: string): Promise<{ picks: PriorityId[]; game: CloudGame | null } | null> {
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const { app } = await import('./storage/auth');
  const snap = await getDoc(doc(getFirestore(app()), 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  const g = d.game as Partial<CloudGame> | undefined;
  return {
    picks: Array.isArray(d.picks) ? (d.picks as PriorityId[]).slice(0, 3) : [],
    game: g ? { run: g.run ?? null, last: g.last ?? null, best: typeof g.best === 'number' ? g.best : 0 } : null,
  };
}

let gameTimer: number | undefined;
/** Signed-in players: writes the game (unfinished term, last result, best score) under users/{uid} (debounced). */
export function saveGameProgress(): void {
  if (STORAGE_MODE !== 'firebase' || !getAccount()) return;
  if (gameTimer) clearTimeout(gameTimer);
  gameTimer = window.setTimeout(async () => {
    try {
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { app, currentUid } = await import('./storage/auth');
      const uid = await currentUid();
      if (!uid) return;
      const game: CloudGame = { run: gameRun(), last: gameResult(), best: bestScore() ?? 0 };
      await setDoc(doc(getFirestore(app()), 'users', uid), { game, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) { console.warn('game save failed', e); }
  }, 600);
}

let saveTimer: number | undefined;
/** Writes the current picks and language under users/{uid} for signed-in accounts (debounced). */
export function saveProgress(): void {
  if (STORAGE_MODE !== 'firebase' || !getAccount()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    try {
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { app, currentUid } = await import('./storage/auth');
      const uid = await currentUid();
      if (!uid) return;
      const lang = getLang();
      await setDoc(doc(getFirestore(app()), 'users', uid), { picks: state.picks.slice(0, 3), lang: LANGS.includes(lang) ? lang : 'ht', updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) { console.warn('progress save failed', e); }
  }, 800);
}

/** After a sign-in: adopt the saved picks and vote from the account when this device has none. */
async function adoptFromCloud(uid: string): Promise<void> {
  try {
    const saved = await progressDoc(uid);
    if (saved && saved.picks.length && state.picks.length === 0) setPicks(saved.picks);
    // the game: keep the better best score, and take the account's term and result when this device has none
    const g = saved?.game;
    if (g) {
      if (g.best > (bestScore() ?? 0)) { try { localStorage.setItem('ppm.president.best', String(g.best)); } catch { /* storage off */ } }
      if (g.run && !gameRun()) saveGameRun(g.run);
      if (g.last && !gameResult()) saveGameResult(g.last);
    }
    const st = await getStorage();
    const v = await st.getMyVote();
    setMyVote(v);
  } catch (e) { console.warn('progress load failed', e); }
}

type AuthModule = typeof import('./storage/auth');
interface Prepared { auth: AuthModule; st: StorageAdapter; prevVote: Vote | null }
let prepared: Prepared | null = null;
let preparing: Promise<Prepared> | null = null;

/**
 * Loads Firebase Auth, the session and the visitor's current vote before the Google tap. The
 * Google popup has to open inside the tap; when this loading happened after the tap, slow
 * connections outlasted the gesture and browsers blocked the popup (auth/popup-blocked).
 */
export function prepareConnect(): Promise<Prepared> {
  preparing ??= (async () => {
    const auth = await import('./storage/auth');
    await auth.authReady();
    const st = await getStorage();
    const prevVote = await st.getMyVote().catch(() => null);
    prepared = { auth, st, prevVote };
    return prepared;
  })();
  preparing.catch(() => { preparing = null; });
  return preparing;
}

/** True once prepareConnect() has finished: a Google tap now opens its window immediately. */
export function isConnectReady(): boolean { return prepared !== null; }

/** Google: the popup opens synchronously when prepareConnect() has finished (the sheet starts it). */
async function connectWithGoogle(): Promise<{ user: FirebaseUser; switched: boolean; prevVote: Vote | null; st: StorageAdapter }> {
  const run = (p: Prepared) => p.auth.connectGoogle(async () => { if (p.prevVote) await p.st.deleteMyVote().catch(() => undefined); })
    .then((r) => ({ ...r, prevVote: p.prevVote, st: p.st }));
  const p = prepared;
  return p ? run(p) : prepareConnect().then(run);
}

/**
 * Connects an account. When the anonymous session cannot be upgraded in place (the account
 * already exists), the anonymous vote is carried over: deleted before the switch, written
 * again after it unless the account already has one.
 */
export async function connect(method: { kind: 'google' } | { kind: 'email'; mode: 'in' | 'up'; email: string; password: string }): Promise<Account> {
  if (method.kind === 'google') {
    const r = await connectWithGoogle();
    if (r.switched && r.prevVote) {
      const existing = await r.st.getMyVote().catch(() => null);
      if (!existing) await r.st.saveVote(r.prevVote).catch(() => undefined);
    }
    return finishConnect(r.user);
  }
  const auth = await import('./storage/auth');
  const st = await getStorage();
  const prevVote: Vote | null = await st.getMyVote().catch(() => null);
  const prevUid = await auth.currentUid();
  const anonymous = prevUid !== null && (await auth.ensureUser()).isAnonymous;
  // Email sign-in into an existing account always switches; delete the anonymous vote first so it is not counted twice.
  const willSwitch = anonymous && method.kind === 'email' && method.mode === 'in';
  if (willSwitch && prevVote) await st.deleteMyVote().catch(() => undefined);

  let result: { user: FirebaseUser; switched: boolean };
  try {
    result = await auth.connectEmail(method.mode, method.email, method.password);
  } catch (e) {
    if (willSwitch && prevVote) await st.saveVote(prevVote).catch(() => undefined); // put it back
    throw e;
  }
  if (result.switched && prevVote) {
    const existing = await st.getMyVote().catch(() => null);
    if (!existing) await st.saveVote(prevVote).catch(() => undefined);
  }
  return finishConnect(result.user);
}

async function finishConnect(user: FirebaseUser): Promise<Account> {
  prepared = null; preparing = null; // the session changed: prepare again next time
  const account = toAccount(user);
  setAccount(account);
  await adoptFromCloud(user.uid);
  saveProgress();
  saveGameProgress();
  return account;
}

export async function disconnect(): Promise<void> {
  const auth = await import('./storage/auth');
  await auth.signOut();
  prepared = null; preparing = null;
  saveGameRun(null); // the unfinished term lives in the account now, not on this device
  setAccount(null);
  setMyVote(null);
}

/** Keeps the saved progress current while signed in. Call once at startup. */
export function initAccount(): void {
  onState(() => saveProgress());
}
