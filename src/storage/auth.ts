import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth, signInAnonymously, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier,
  GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, type Auth, type ConfirmationResult, type User,
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

export async function signInAdmin(): Promise<User> {
  const cred = await signInWithPopup(auth(), new GoogleAuthProvider());
  return cred.user;
}

export async function signOut(): Promise<void> { await fbSignOut(auth()); }

export function onUser(cb: (u: User | null) => void): () => void { return onAuthStateChanged(auth(), cb); }
