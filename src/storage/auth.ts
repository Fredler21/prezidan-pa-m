import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth, signInAnonymously, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier,
  GoogleAuthProvider, EmailAuthProvider, signInWithPopup, linkWithPopup, linkWithCredential, signInWithCredential,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  signOut as fbSignOut, type Auth, type ConfirmationResult, type User, type AuthError,
} from 'firebase/auth';
import { firebaseConfig } from '../firebase-config';

export type AuthMode = 'anonymous' | 'phone';
/** VITE_AUTH=phone switches the vote flow to SMS verification (needs Phone sign-in enabled + Blaze for non-free regions). */
export const AUTH_MODE: AuthMode = import.meta.env.VITE_AUTH === 'phone' ? 'phone' : 'anonymous';

export function app(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}
export function auth(): Auth { return getAuth(app()); }

function currentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth(), (u) => { off(); resolve(u); });
  });
}

export class NeedsPhoneError extends Error { constructor() { super('needs-phone'); } }

/** Resolves a signed-in user. Anonymous mode signs in silently; phone mode requires a prior OTP. */
export async function ensureUser(): Promise<User> {
  const u = await currentUser();
  if (u) return u;
  if (AUTH_MODE === 'phone') throw new NeedsPhoneError();
  const cred = await signInAnonymously(auth());
  return cred.user;
}

export async function currentUid(): Promise<string | null> {
  const u = await currentUser();
  return u ? u.uid : null;
}

let recaptcha: RecaptchaVerifier | null = null;
let pending: ConfirmationResult | null = null;

/** Step 1 of phone verification. `containerId` is an empty div for the invisible reCAPTCHA. */
export async function startPhoneVerification(phone: string, containerId: string): Promise<void> {
  recaptcha ??= new RecaptchaVerifier(auth(), containerId, { size: 'invisible' });
  pending = await signInWithPhoneNumber(auth(), phone, recaptcha);
}

/** Step 2: confirm the 6-digit code. */
export async function confirmPhoneCode(code: string): Promise<User> {
  if (!pending) throw new Error('no-pending-verification');
  const cred = await pending.confirm(code);
  pending = null;
  return cred.user;
}

/**
 * Account sign-in with Google. An anonymous session is upgraded in place (same uid, so the
 * vote and picks stay); when that Google account already exists, we sign into it instead and
 * report `switched: true` so the caller can carry the anonymous vote over.
 */
export async function connectGoogle(): Promise<{ user: User; switched: boolean }> {
  const a = auth();
  const provider = new GoogleAuthProvider();
  const cur = a.currentUser;
  if (cur && cur.isAnonymous) {
    try { return { user: (await linkWithPopup(cur, provider)).user, switched: false }; }
    catch (e) {
      if ((e as AuthError).code === 'auth/credential-already-in-use') {
        const cred = GoogleAuthProvider.credentialFromError(e as AuthError);
        if (cred) return { user: (await signInWithCredential(a, cred)).user, switched: true };
      }
      throw e;
    }
  }
  return { user: (await signInWithPopup(a, provider)).user, switched: Boolean(cur) };
}

/** Email + password: 'up' creates the account (upgrading an anonymous session in place), 'in' signs into an existing one. */
export async function connectEmail(mode: 'in' | 'up', email: string, password: string): Promise<{ user: User; switched: boolean }> {
  const a = auth();
  const cur = a.currentUser;
  if (mode === 'up') {
    if (cur && cur.isAnonymous) return { user: (await linkWithCredential(cur, EmailAuthProvider.credential(email, password))).user, switched: false };
    return { user: (await createUserWithEmailAndPassword(a, email, password)).user, switched: Boolean(cur) };
  }
  return { user: (await signInWithEmailAndPassword(a, email, password)).user, switched: Boolean(cur) };
}

export function resetPassword(email: string): Promise<void> { return sendPasswordResetEmail(auth(), email); }

export async function signInAdmin(): Promise<User> {
  const cred = await signInWithPopup(auth(), new GoogleAuthProvider());
  return cred.user;
}

export async function signOut(): Promise<void> { await fbSignOut(auth()); }

export function onUser(cb: (u: User | null) => void): () => void { return onAuthStateChanged(auth(), cb); }
