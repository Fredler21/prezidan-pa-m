/**
 * Version of the bundled content (src/data/*), format YYYYMMDDnn (date + daily counter).
 * Bump it whenever candidates, priorities, departments, dates or sources change here.
 *
 * The app shows Firestore content only when meta/content.version >= CONTENT_VERSION, so a
 * newer deploy is never overridden by stale Firestore data. Publishing from the bundle writes
 * meta/content.version = CONTENT_VERSION.
 */
export const CONTENT_VERSION = 2026103001;
