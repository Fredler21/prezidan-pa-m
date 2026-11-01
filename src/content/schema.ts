import type { Candidate, CandidateTag, Department, DepartmentId, KeyDate, L10n, L10nList, Priority, PriorityId, Source } from '../types';

/*
 * Firestore content schema: the single source of truth for the editable content layer.
 *
 *   candidates/{id}    CandidateDoc   (+ updatedAt: Timestamp, added by the writer)
 *   priorities/{id}    PriorityDoc
 *   departments/{id}   DepartmentDoc
 *   meta/content       MetaDoc        (+ publishedAt: Timestamp, publishedBy: string)
 *
 * toDocs() turns the bundled data (src/data/*) into those documents and fromDocs() validates
 * decoded documents back into what the app renders. Both are pure: no Firebase SDK, no DOM,
 * no Vite globals, so Node can import this file with type stripping (scripts/test-content.mjs).
 */

/** Content as the app consumes it. The bundled data has this shape too (src/content/bundled.ts). */
export interface ContentData {
  /** YYYYMMDDnn, see src/data/version.ts. */
  version: number;
  /** Active candidates in document order (the UI shuffles them once per page load). */
  candidates: readonly Candidate[];
  priorities: readonly Priority[];
  departments: readonly Department[];
  dates: readonly KeyDate[];
  sources: readonly Source[];
  /** ISO dates, YYYY-MM-DD. */
  contentUpdated: string;
  datesUpdated: string;
  /** ISO time of the last publish (meta/content.publishedAt); Firestore content only. */
  publishedAt?: string;
  publishedBy?: string;
}

export interface CandidateDoc {
  id: string;
  name: string;
  party: string;
  partyFull: string;
  role?: L10n;
  bio: L10n;
  record: L10nList;
  term?: { title: L10n; items: L10nList };
  /** Priority ids must exist in priorities/{id}. */
  tags: { id: string; note: L10n }[];
  sources: Source[];
  photo?: string;
  photoCredit?: string;
  status?: L10n;
  /** false hides the candidate everywhere without deleting the document. */
  active: boolean;
  /** Index in the bundled array; the reader sorts by it. */
  order: number;
}

export interface PriorityDoc { id: string; label: L10n; order: number }
export interface DepartmentDoc { id: string; label: L10n; order: number }

export interface MetaDoc {
  version: number;
  contentUpdated: string;
  datesUpdated: string;
  dates: KeyDate[];
  sources: Source[];
}

/** Everything a publish writes, keyed by document id. No Timestamps: callers add them. */
export interface ContentDocs {
  candidates: Record<string, CandidateDoc>;
  priorities: Record<string, PriorityDoc>;
  departments: Record<string, DepartmentDoc>;
  meta: { content: MetaDoc };
}

/** Decoded but not yet validated documents keyed by id: what the reader hands to fromDocs(). */
export interface RawDocs {
  candidates: Record<string, unknown>;
  priorities: Record<string, unknown>;
  departments: Record<string, unknown>;
  meta: { content?: unknown };
}

export type Warn = (message: string) => void;

// ---------------------------------------------------------------------------------------------
// Bundled data -> documents
// ---------------------------------------------------------------------------------------------

const copyL10n = (v: L10n): L10n => ({ ht: v.ht, fr: v.fr, en: v.en });
const copyList = (v: L10nList): L10nList => ({ ht: v.ht.slice(), fr: v.fr.slice(), en: v.en.slice() });
const copySource = (s: Source): Source => (s.date ? { label: s.label, url: s.url, date: s.date } : { label: s.label, url: s.url });

function candidateDoc(c: Candidate, order: number): CandidateDoc {
  // Optional fields are only set when present: Firestore rejects `undefined` values.
  const d: CandidateDoc = {
    id: c.id,
    name: c.name,
    party: c.party,
    partyFull: c.partyFull,
    bio: copyL10n(c.bio),
    record: copyList(c.record),
    tags: c.tags.map((t) => ({ id: t.id, note: copyL10n(t.note) })),
    sources: c.sources.map(copySource),
    active: true,
    order,
  };
  if (c.role) d.role = copyL10n(c.role);
  if (c.term) d.term = { title: copyL10n(c.term.title), items: copyList(c.term.items) };
  if (c.photo) d.photo = c.photo;
  if (c.photoCredit) d.photoCredit = c.photoCredit;
  if (c.status) d.status = copyL10n(c.status);
  return d;
}

/** Pure: bundled content -> the exact documents to write. Callers add updatedAt / publishedAt with serverTimestamp(). */
export function toDocs(bundled: ContentData): ContentDocs {
  const candidates: Record<string, CandidateDoc> = {};
  bundled.candidates.forEach((c, i) => { candidates[c.id] = candidateDoc(c, i); });
  const priorities: Record<string, PriorityDoc> = {};
  bundled.priorities.forEach((p, i) => { priorities[p.id] = { id: p.id, label: copyL10n(p.label), order: i }; });
  const departments: Record<string, DepartmentDoc> = {};
  bundled.departments.forEach((d, i) => { departments[d.id] = { id: d.id, label: copyL10n(d.label), order: i }; });
  return {
    candidates,
    priorities,
    departments,
    meta: {
      content: {
        version: bundled.version,
        contentUpdated: bundled.contentUpdated,
        datesUpdated: bundled.datesUpdated,
        dates: bundled.dates.map((d) => ({ date: d.date, label: copyL10n(d.label) })),
        sources: bundled.sources.map(copySource),
      },
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Validation helpers (documents -> app shapes). Lenient on optional fields, strict on identity.
// ---------------------------------------------------------------------------------------------

type Obj = Record<string, unknown>;

const ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTTP_RE = /^https?:\/\/\S+$/i;
/** Bare file name under /photos/ (no path separators). */
const FILE_RE = /^[\w][\w.-]*$/;

export function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number.MAX_SAFE_INTEGER);

/** {ht, fr, en} with a non-empty Kreyòl text. Missing French/English fall back to Kreyòl at render time (i18n l()). */
export function asL10n(v: unknown): L10n | null {
  if (!isObj(v)) return null;
  const ht = str(v.ht);
  if (!ht.trim()) return null;
  return { ht, fr: str(v.fr), en: str(v.en) };
}

export function asL10nList(v: unknown): L10nList {
  const o = isObj(v) ? v : {};
  return { ht: strList(o.ht), fr: strList(o.fr), en: strList(o.en) };
}

/** Keeps entries with a label and an http(s) URL; anything else is skipped. */
export function asSources(v: unknown): Source[] {
  if (!Array.isArray(v)) return [];
  const out: Source[] = [];
  for (const s of v) {
    if (!isObj(s)) continue;
    const label = str(s.label).trim();
    const url = str(s.url).trim();
    if (!label || !HTTP_RE.test(url)) continue;
    const date = str(s.date);
    out.push(DATE_RE.test(date) ? { label, url, date } : { label, url });
  }
  return out;
}

/** null when any tag is malformed or names a priority that does not exist (the document is then invalid). */
export function asTags(v: unknown, knownPriorityIds: ReadonlySet<string>): CandidateTag[] | null {
  if (v === undefined) return [];
  if (!Array.isArray(v)) return null;
  const out: CandidateTag[] = [];
  for (const t of v) {
    if (!isObj(t)) return null;
    const id = str(t.id);
    const note = asL10n(t.note);
    if (!knownPriorityIds.has(id) || !note) return null;
    out.push({ id: id as PriorityId, note });
  }
  return out;
}

export function asDates(v: unknown): KeyDate[] {
  if (!Array.isArray(v)) return [];
  const out: KeyDate[] = [];
  for (const d of v) {
    if (!isObj(d)) continue;
    const date = str(d.date);
    const label = asL10n(d.label);
    if (DATE_RE.test(date) && label) out.push({ date, label });
  }
  return out;
}

interface Read<T> { value: T; order: number; active: boolean }

function readCollection<T>(raw: unknown, read: (key: string, doc: unknown) => Read<T> | null): T[] {
  if (!isObj(raw)) return [];
  const rows: { key: string; r: Read<T> }[] = [];
  for (const [key, doc] of Object.entries(raw)) {
    const r = read(key, doc);
    if (r && r.active) rows.push({ key, r });
  }
  rows.sort((a, b) => a.r.order - b.r.order || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return rows.map((x) => x.r.value);
}

function readLabelled(collection: string, key: string, raw: unknown, warn: Warn): Read<{ id: string; label: L10n }> | null {
  const fail = (why: string): null => { warn(`content: ${collection}/${key} dropped: ${why}`); return null; };
  if (!isObj(raw)) return fail('not an object');
  const id = str(raw.id);
  if (id !== key || !ID_RE.test(id)) return fail('id must equal the document id (lowercase slug)');
  const label = asL10n(raw.label);
  if (!label) return fail('missing label.ht');
  return { value: { id, label }, order: num(raw.order), active: true };
}

function readCandidate(key: string, raw: unknown, knownPriorityIds: ReadonlySet<string>, warn: Warn): Read<Candidate> | null {
  const fail = (why: string): null => { warn(`content: candidates/${key} dropped: ${why}`); return null; };
  if (!isObj(raw)) return fail('not an object');
  const id = str(raw.id);
  if (id !== key || !ID_RE.test(id)) return fail('id must equal the document id (lowercase slug)');
  const name = str(raw.name).trim();
  if (!name) return fail('missing name');
  const party = str(raw.party).trim();
  if (!party) return fail('missing party');
  const bio = asL10n(raw.bio);
  if (!bio) return fail('missing bio.ht');
  const tags = asTags(raw.tags, knownPriorityIds);
  if (!tags) return fail('tags must be [{ id: <existing priority id>, note: {ht, fr, en} }]');

  const c: Candidate = {
    id,
    name,
    party,
    partyFull: str(raw.partyFull).trim() || party,
    bio,
    record: asL10nList(raw.record),
    tags,
    sources: asSources(raw.sources),
  };
  const role = asL10n(raw.role);
  if (role) c.role = role;
  if (isObj(raw.term)) {
    const title = asL10n(raw.term.title);
    if (title) c.term = { title, items: asL10nList(raw.term.items) };
  }
  const photo = str(raw.photo);
  if (FILE_RE.test(photo)) c.photo = photo;
  const photoCredit = str(raw.photoCredit).trim();
  if (photoCredit) c.photoCredit = photoCredit;
  const status = asL10n(raw.status);
  if (status) c.status = status;
  return { value: c, order: num(raw.order), active: raw.active !== false };
}

interface Meta {
  version: number;
  contentUpdated: string;
  datesUpdated: string;
  dates: KeyDate[];
  sources: Source[];
  publishedAt?: string;
  publishedBy?: string;
}

function readMeta(raw: unknown, warn: Warn): Meta | null {
  if (!isObj(raw)) { warn('content: meta/content missing or not an object'); return null; }
  const version = raw.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version <= 0) { warn('content: meta/content.version must be a positive integer (YYYYMMDDnn)'); return null; }
  const contentUpdated = str(raw.contentUpdated);
  const datesUpdated = str(raw.datesUpdated);
  const m: Meta = {
    version,
    contentUpdated: DATE_RE.test(contentUpdated) ? contentUpdated : '',
    datesUpdated: DATE_RE.test(datesUpdated) ? datesUpdated : '',
    dates: asDates(raw.dates),
    sources: asSources(raw.sources),
  };
  const publishedAt = str(raw.publishedAt);
  if (publishedAt) m.publishedAt = publishedAt;
  const publishedBy = str(raw.publishedBy);
  if (publishedBy) m.publishedBy = publishedBy;
  return m;
}

/**
 * Validates decoded documents into ContentData. Invalid documents are dropped with a warning
 * (never a throw). Returns null when there is nothing usable: no meta/content, no version,
 * no priorities or departments, or no active candidate; the caller then keeps the bundled data.
 * Blank contentUpdated / datesUpdated and empty dates / sources are left for the caller to fill.
 */
export function fromDocs(docs: RawDocs, warn: Warn = (m) => console.warn(m)): ContentData | null {
  const meta = readMeta(isObj(docs.meta) ? docs.meta.content : undefined, warn);
  if (!meta) return null;

  const priorities: Priority[] = readCollection(docs.priorities, (k, d) => readLabelled('priorities', k, d, warn))
    .map((p) => ({ id: p.id as PriorityId, label: p.label }));
  const departments: Department[] = readCollection(docs.departments, (k, d) => readLabelled('departments', k, d, warn))
    .map((d) => ({ id: d.id as DepartmentId, label: d.label }));
  if (!priorities.length || !departments.length) { warn('content: priorities and departments must not be empty'); return null; }

  const known = new Set<string>(priorities.map((p) => p.id));
  const candidates = readCollection(docs.candidates, (k, d) => readCandidate(k, d, known, warn));
  if (!candidates.length) { warn('content: no active candidate'); return null; }

  const data: ContentData = {
    version: meta.version,
    candidates,
    priorities,
    departments,
    dates: meta.dates,
    sources: meta.sources,
    contentUpdated: meta.contentUpdated,
    datesUpdated: meta.datesUpdated,
  };
  if (meta.publishedAt) data.publishedAt = meta.publishedAt;
  if (meta.publishedBy) data.publishedBy = meta.publishedBy;
  return data;
}
