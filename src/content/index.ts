import type { Candidate } from '../types';
import { CONTENT_VERSION } from '../data/version';
import { firebaseConfig } from '../firebase-config';
import { shuffle } from '../lib/util';
import { BUNDLED } from './bundled';
import { fromDocs, isObj, type ContentData, type RawDocs } from './schema';
import { getDocument, listCollection, type RestConfig } from './firestore-rest';

/*
 * Content layer. The UI reads a synchronous snapshot, content(), which is:
 *   1. the Firestore content cached in localStorage ('ppm.content.v1') when its version is at
 *      least CONTENT_VERSION (src/data/version.ts), else
 *   2. the bundled data in src/data/* (source: 'bundled').
 * refreshContent() asks Firestore (REST, no SDK, see firestore-rest.ts) for newer content after
 * the first paint and emits onContentChange when the snapshot changes. Offline, slow, denied or
 * empty Firestore never changes anything: the bundled data always works.
 */

export { BUNDLED } from './bundled';
export { toDocs, fromDocs } from './schema';
export type { ContentData, ContentDocs, RawDocs, CandidateDoc, PriorityDoc, DepartmentDoc, MetaDoc, Warn } from './schema';

export type ContentSource = 'bundled' | 'firestore';
export interface Content extends ContentData { source: ContentSource }

export const CACHE_KEY = 'ppm.content.v1';

const REST: RestConfig = { projectId: firebaseConfig.projectId, apiKey: firebaseConfig.apiKey };

let snapshot: Content | null = null;
let inflight: Promise<boolean> | null = null;
const listeners = new Set<(c: Content) => void>();

// Per-snapshot memos (a new snapshot object means a new shuffle and a new index).
let shuffledFor: Content | null = null;
let shuffled: readonly Candidate[] = [];
let indexFor: Content | null = null;
let index = new Map<string, Candidate>();

function bundledSnapshot(): Content {
  return { ...BUNDLED, source: 'bundled' };
}

/**
 * Version gate. Firestore content is used only when its version >= CONTENT_VERSION, so a newer
 * deploy always wins over stale Firestore data. Blank dates / sources fall back to the bundle.
 */
export function selectContent(data: ContentData | null): Content {
  if (!data || data.version < CONTENT_VERSION) return bundledSnapshot();
  return {
    ...data,
    contentUpdated: data.contentUpdated || BUNDLED.contentUpdated,
    datesUpdated: data.datesUpdated || BUNDLED.datesUpdated,
    dates: data.dates.length ? data.dates : BUNDLED.dates,
    sources: data.sources.length ? data.sources : BUNDLED.sources,
    source: 'firestore',
  };
}

/** Synchronous snapshot: cached Firestore content when valid and current, else the bundled data. */
export function content(): Content {
  if (!snapshot) {
    const docs = readCache();
    snapshot = selectContent(docs ? fromDocs(docs) : null);
  }
  return snapshot;
}

/** Called with the new snapshot whenever refreshContent() changes it. Returns an unsubscribe. */
export function onContentChange(fn: (c: Content) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function candidateById(id: string): Candidate | undefined {
  const c = content();
  if (indexFor !== c) {
    index = new Map(c.candidates.map((x) => [x.id, x]));
    indexFor = c;
  }
  return index.get(id);
}

/** Random order, fixed for this page load and this snapshot (neutrality rule: random order on every load). */
export function candidatesShuffled(): readonly Candidate[] {
  const c = content();
  if (shuffledFor !== c) {
    shuffled = shuffle(c.candidates);
    shuffledFor = c;
  }
  return shuffled;
}

/**
 * GET meta/content (tiny). When its version >= CONTENT_VERSION and differs from the snapshot
 * (version or publishedAt), GET candidates, priorities and departments, validate, cache and emit.
 * Resolves true when the snapshot changed. Never rejects; concurrent calls share one request.
 */
export function refreshContent(): Promise<boolean> {
  inflight ??= doRefresh()
    .catch((e: unknown) => { console.warn('content: refresh failed', e); return false; })
    .finally(() => { inflight = null; });
  return inflight;
}

async function doRefresh(): Promise<boolean> {
  const meta = await getDocument(REST, 'meta/content');
  if (!meta.ok) { if (meta.status) console.warn(`content: meta/content ${meta.error}`); return false; }
  if (!meta.value) return false; // nothing published yet
  const version = meta.value.version;
  if (typeof version !== 'number' || version < CONTENT_VERSION) return false; // the bundle is newer
  const publishedAt = typeof meta.value.publishedAt === 'string' ? meta.value.publishedAt : undefined;
  const cur = content();
  if (cur.source === 'firestore' && cur.version === version && cur.publishedAt === publishedAt) return false;

  const [candidates, priorities, departments] = await Promise.all([
    listCollection(REST, 'candidates'),
    listCollection(REST, 'priorities'),
    listCollection(REST, 'departments'),
  ]);
  if (!candidates.ok || !priorities.ok || !departments.ok) {
    for (const r of [candidates, priorities, departments]) if (!r.ok && r.status) console.warn(`content: ${r.error}`);
    return false;
  }
  const docs: RawDocs = { candidates: candidates.value, priorities: priorities.value, departments: departments.value, meta: { content: meta.value } };
  const data = fromDocs(docs);
  if (!data) return false;
  const next = selectContent(data);
  if (next.source !== 'firestore') return false;

  writeCache(docs);
  snapshot = next;
  for (const fn of listeners) {
    try { fn(next); } catch (e) { console.error(e); }
  }
  return true;
}

// ---- localStorage cache: the raw decoded documents, re-validated by fromDocs() on every load ----

interface CacheEntry { v: 1; savedAt: number; docs: RawDocs }

function readCache(): RawDocs | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as unknown;
    if (isObj(entry) && entry.v === 1 && isObj(entry.docs)) return entry.docs as unknown as RawDocs;
  } catch { /* private mode, quota, corrupt JSON */ }
  return null;
}

function writeCache(docs: RawDocs): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const entry: CacheEntry = { v: 1, savedAt: Date.now(), docs };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* quota or private mode: the next load refetches */ }
}
