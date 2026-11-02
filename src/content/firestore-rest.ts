/*
 * Minimal Firestore REST reader. No Firebase SDK (that is ~100 KB gzipped; this is under 1 KB),
 * only fetch() with the public web API key: security rules decide what is readable.
 * Every function resolves to a RestResult and never throws; an 8 s timeout aborts slow requests.
 */

export interface RestConfig {
  projectId: string;
  apiKey: string;
  /** Default 8000 ms. */
  timeoutMs?: number;
}

export type RestResult<T> = { ok: true; value: T } | { ok: false; error: string; status?: number };

/** A document's fields decoded to plain JSON (Timestamps become ISO strings). */
export type Decoded = Record<string, unknown>;

const DEFAULT_TIMEOUT_MS = 8000;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export function documentsUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

/** Last path segment of a document resource name. */
export function docId(name: unknown): string {
  const s = typeof name === 'string' ? name : '';
  const i = s.lastIndexOf('/');
  return i >= 0 ? s.slice(i + 1) : s;
}

/** Firestore typed value -> plain JSON. Unknown or malformed values decode to null. */
export function decodeValue(v: unknown): unknown {
  if (!isObj(v)) return null;
  if ('stringValue' in v) return typeof v.stringValue === 'string' ? v.stringValue : String(v.stringValue ?? '');
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue === true;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return typeof v.timestampValue === 'string' ? v.timestampValue : null;
  if ('mapValue' in v) return decodeFields(isObj(v.mapValue) ? v.mapValue.fields : undefined);
  if ('arrayValue' in v) {
    const values = isObj(v.arrayValue) ? v.arrayValue.values : undefined;
    return Array.isArray(values) ? values.map(decodeValue) : [];
  }
  if ('referenceValue' in v) return typeof v.referenceValue === 'string' ? v.referenceValue : null;
  if ('geoPointValue' in v) return isObj(v.geoPointValue) ? { latitude: Number(v.geoPointValue.latitude), longitude: Number(v.geoPointValue.longitude) } : null;
  if ('bytesValue' in v) return typeof v.bytesValue === 'string' ? v.bytesValue : null;
  return null;
}

/** `fields` of a REST document -> plain object. */
export function decodeFields(fields: unknown): Decoded {
  const out: Decoded = {};
  if (!isObj(fields)) return out;
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

async function getJson(url: string, timeoutMs: number): Promise<RestResult<unknown>> {
  if (typeof fetch !== 'function') return { ok: false, error: 'fetch unavailable' };
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
  try {
    const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    return { ok: true, value: (await res.json()) as unknown };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

function keyParam(cfg: RestConfig): string {
  return `key=${encodeURIComponent(cfg.apiKey)}`;
}

async function postJson(url: string, body: unknown, timeoutMs: number): Promise<RestResult<unknown>> {
  if (typeof fetch !== 'function') return { ok: false, error: 'fetch unavailable' };
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
  try {
    const init: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
    if (ctrl) init.signal = ctrl.signal;
    const res = await fetch(url, init);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    return { ok: true, value: (await res.json()) as unknown };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

/** Server-side count of a collection, optionally filtered on one string field (count() aggregation: 1 read per 1000 docs). */
export async function countDocuments(cfg: RestConfig, collection: string, where?: { field: string; equals: string }): Promise<RestResult<number>> {
  const structuredQuery: Obj = { from: [{ collectionId: collection }] };
  if (where) structuredQuery.where = { fieldFilter: { field: { fieldPath: where.field }, op: 'EQUAL', value: { stringValue: where.equals } } };
  const r = await postJson(`${documentsUrl(cfg.projectId)}:runAggregationQuery?${keyParam(cfg)}`, { structuredAggregationQuery: { aggregations: [{ alias: 'n', count: {} }], structuredQuery } }, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r;
  const rows = Array.isArray(r.value) ? r.value : [];
  for (const row of rows) {
    if (!isObj(row) || !isObj(row.result)) continue;
    const fields = isObj(row.result.aggregateFields) ? row.result.aggregateFields : {};
    const n = decodeValue(fields.n);
    return { ok: true, value: typeof n === 'number' && Number.isFinite(n) ? n : 0 };
  }
  return { ok: true, value: 0 };
}

/** The newest document of a collection where a boolean field is true (used for the active poll). value is null when none. */
export async function findActive(cfg: RestConfig, collection: string, flagField: string, orderByField: string): Promise<RestResult<{ id: string; data: Decoded } | null>> {
  const body = { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: flagField }, op: 'EQUAL', value: { booleanValue: true } } }, orderBy: [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }], limit: 1 } };
  const r = await postJson(`${documentsUrl(cfg.projectId)}:runQuery?${keyParam(cfg)}`, body, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r;
  const rows = Array.isArray(r.value) ? r.value : [];
  for (const row of rows) {
    if (!isObj(row) || !isObj(row.document)) continue;
    return { ok: true, value: { id: docId(row.document.name), data: decodeFields(row.document.fields) } };
  }
  return { ok: true, value: null };
}

/** GET one document, e.g. getDocument(cfg, 'meta/content'). value is null when it does not exist (404). */
export async function getDocument(cfg: RestConfig, path: string): Promise<RestResult<Decoded | null>> {
  const r = await getJson(`${documentsUrl(cfg.projectId)}/${path}?${keyParam(cfg)}`, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r.status === 404 ? { ok: true, value: null } : r;
  return { ok: true, value: decodeFields(isObj(r.value) ? r.value.fields : undefined) };
}

/** GET a whole collection (pageSize 100, follows nextPageToken), keyed by document id. Empty collection -> {}. */
export async function listCollection(cfg: RestConfig, collection: string): Promise<RestResult<Record<string, Decoded>>> {
  const out: Record<string, Decoded> = {};
  const timeout = cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let pageToken: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${documentsUrl(cfg.projectId)}/${collection}?pageSize=${PAGE_SIZE}&${keyParam(cfg)}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const r = await getJson(url, timeout);
    if (!r.ok) return r;
    const body: Obj = isObj(r.value) ? r.value : {};
    const documents = Array.isArray(body.documents) ? body.documents : [];
    for (const d of documents) {
      if (!isObj(d)) continue;
      const id = docId(d.name);
      if (id) out[id] = decodeFields(d.fields);
    }
    pageToken = typeof body.nextPageToken === 'string' && body.nextPageToken ? body.nextPageToken : null;
    if (!pageToken) break;
  }
  return { ok: true, value: out };
}

/**
 * Like getDocument, via POST :batchGet: a document that does not exist answers 200 with
 * { missing }, so probing an optional document (stats/presidential) logs no 404 in the console.
 */
export async function getDocumentQuiet(cfg: RestConfig, path: string): Promise<RestResult<Decoded | null>> {
  const name = `projects/${cfg.projectId}/databases/(default)/documents/${path}`;
  const r = await postJson(`${documentsUrl(cfg.projectId)}:batchGet?${keyParam(cfg)}`, { documents: [name] }, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r;
  const rows = Array.isArray(r.value) ? r.value : [];
  for (const row of rows) {
    if (!isObj(row)) continue;
    if (isObj(row.found)) return { ok: true, value: decodeFields(row.found.fields) };
    if (typeof row.missing === 'string') return { ok: true, value: null };
  }
  return { ok: true, value: null };
}

/** Server-side count with several equality filters combined with AND (needs a composite index for 2+ fields). */
export async function countWhere(cfg: RestConfig, collection: string, filters: { field: string; equals: string }[]): Promise<RestResult<number>> {
  const eq = (f: { field: string; equals: string }) => ({ fieldFilter: { field: { fieldPath: f.field }, op: 'EQUAL', value: { stringValue: f.equals } } });
  const structuredQuery: Obj = { from: [{ collectionId: collection }] };
  const first = filters[0];
  if (filters.length === 1 && first) structuredQuery.where = eq(first);
  else if (filters.length > 1) structuredQuery.where = { compositeFilter: { op: 'AND', filters: filters.map(eq) } };
  const r = await postJson(`${documentsUrl(cfg.projectId)}:runAggregationQuery?${keyParam(cfg)}`, { structuredAggregationQuery: { aggregations: [{ alias: 'n', count: {} }], structuredQuery } }, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r;
  const rows = Array.isArray(r.value) ? r.value : [];
  for (const row of rows) {
    if (!isObj(row) || !isObj(row.result)) continue;
    const fields = isObj(row.result.aggregateFields) ? row.result.aggregateFields : {};
    const n = decodeValue(fields.n);
    return { ok: true, value: typeof n === 'number' && Number.isFinite(n) ? n : 0 };
  }
  return { ok: true, value: 0 };
}

/** Newest documents of a collection by a timestamp field, only the listed fields (1 read per document). */
export async function recentDocs(cfg: RestConfig, collection: string, orderByField: string, limit: number, fields: string[]): Promise<RestResult<{ id: string; data: Decoded }[]>> {
  const body = { structuredQuery: { from: [{ collectionId: collection }], select: { fields: fields.map((f) => ({ fieldPath: f })) }, orderBy: [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }], limit } };
  const r = await postJson(`${documentsUrl(cfg.projectId)}:runQuery?${keyParam(cfg)}`, body, cfg.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (!r.ok) return r;
  const rows = Array.isArray(r.value) ? r.value : [];
  const out: { id: string; data: Decoded }[] = [];
  for (const row of rows) {
    if (!isObj(row) || !isObj(row.document)) continue;
    out.push({ id: docId(row.document.name), data: decodeFields(row.document.fields) });
  }
  return { ok: true, value: out };
}
