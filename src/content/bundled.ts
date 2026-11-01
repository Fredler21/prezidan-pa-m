import { CANDIDATES } from '../data/candidates';
import { PRIORITIES } from '../data/priorities';
import { DEPARTMENTS } from '../data/departments';
import { DATES, GENERAL_SOURCES, CONTENT_UPDATED, DATES_UPDATED } from '../data/dates';
import { CONTENT_VERSION } from '../data/version';
import type { ContentData } from './schema';

/** The data shipped with the app (src/data/*): the fallback whenever Firestore is empty, older or unreachable. */
export const BUNDLED: ContentData = {
  version: CONTENT_VERSION,
  candidates: CANDIDATES,
  priorities: PRIORITIES,
  departments: DEPARTMENTS,
  dates: DATES,
  sources: GENERAL_SOURCES,
  contentUpdated: CONTENT_UPDATED,
  datesUpdated: DATES_UPDATED,
};
