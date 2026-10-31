import type { StorageAdapter, StorageMode } from '../types';

/**
 * One place to swap the backend. `VITE_STORAGE=local` forces the localStorage demo
 * (e.g. `npm run dev` with a .env.local), anything else uses Firebase.
 *
 * The adapter is loaded on demand so the Start / Match / Profile / About pages never
 * download the Firebase SDK, only Vote, Results, Poll and Admin do.
 */
export const STORAGE_MODE: StorageMode = import.meta.env.VITE_STORAGE === 'local' ? 'local' : 'firebase';

let instance: Promise<StorageAdapter> | null = null;

export function getStorage(): Promise<StorageAdapter> {
  instance ??= STORAGE_MODE === 'local'
    ? import('./local').then((m) => m.createLocalStorage())
    : import('./firebase').then((m) => m.createFirebaseStorage());
  return instance;
}
