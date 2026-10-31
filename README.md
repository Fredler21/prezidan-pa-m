# Prezidan Pa M — Ayiti 2027

A neutral, mobile-first people's vote for Haiti's 2027 presidential election. Visitors start from
what they want changed in the country, see which candidates have a **public record** on those
priorities, read each candidate's profile with sources, and vote — one vote per person, changeable.
A weekly poll runs alongside the presidential vote.

Full UI in Haitian Kreyòl (default), French and English. The language is picked automatically from
the visitor's area and can always be switched in the header.

- Live site: https://prezidan-pa-m.web.app
- Design: Google Stitch project "Prezidan Pa M — Ayiti 2027" (seven mobile screens + design system)
- Stack: TypeScript, Vite, hand-written CSS, Firebase (Hosting, Firestore, Auth), optional Cloud Functions

## Neutrality rules (non-negotiable)

- Identical card format and size for every candidate; random order on every page load.
- Avatars in a shared blue/indigo hue; photos only when freely licensed, same crop for everyone; never party colors or logos.
- A candidate gets a priority tag only with a public record (office held, documented action, published platform), each with a one-line sourced note. No record → "Platform not yet published". We never guess.
- The ranking is labelled "not a recommendation"; results are labelled a people's vote, not a scientific poll.
- No candidate or party content, ads or money. Results are shown, never nudged.

## Project layout

```
index.html                 app shell (Bricolage Grotesque from Google Fonts is the only external resource)
src/main.ts                boot + hash router (#start #match #candidates #vote #results #about #poll #admin)
src/styles.css             design tokens (light + dark via prefers-color-scheme) and components
src/data/                  PRIORITIES, CANDIDATES (id, name, party, bio{ht,fr,en}, record, term, tags, sources), DATES, DEPARTMENTS
src/i18n/strings.ts        UI strings T{ht,fr,en}; src/i18n/index.ts detects and persists the language
src/storage/               StorageAdapter: saveVote / subscribeVotes (+ polls); local.ts (demo) and firebase.ts
src/ui/                    views: start, match, profile sheet, vote, results, about, poll, admin
functions/                 optional Cloud Functions that keep stats/* aggregates (Blaze plan)
firestore.rules            security rules (one vote per user, 240-char reasons, no URLs, admin-only polls)
public/photos/             320×320 candidate portraits + credits.json (licenses)
scripts/photos.mjs         rebuilds the portraits from the licensed originals
```

## Run locally

```bash
npm install
cp .env.example .env.local      # optional: VITE_STORAGE=local for demo mode without Firebase
npm run dev
```

`npm run typecheck` and `npm run build` must pass before deploying.

## Firebase setup (project `prezidan-pa-m`)

Already done from the CLI: project, web app, Firestore database, rules deployed.
Still needed in the console (one-time, Spark plan is enough):

1. **Authentication → Sign-in method → Anonymous: enable.** Votes are keyed by the anonymous uid (one vote per browser profile).
2. **Authentication → Sign-in method → Google: enable** so the admin can sign in at `#admin` to post the weekly poll. Admin emails are allow-listed in `firestore.rules` (`isAdmin`) and `src/ui/admin.ts`.
3. Optional, stronger one-person-one-vote: enable **Phone** sign-in, set `VITE_AUTH=phone`, rebuild. SMS to Haiti is billed (Blaze plan).
4. Optional, cheaper at scale: `cd functions && npm install && npm run build && firebase deploy --only functions` (Blaze plan). The client switches to the `stats/*` aggregates automatically.

Deploy: `npm run deploy` (builds, then deploys Hosting + Firestore rules and indexes).

## Weekly poll

Open `https://prezidan-pa-m.web.app/#admin`, sign in with an allow-listed Google account, fill the
question and answers in the three languages (French/English fall back to Kreyòl if left empty), set the
dates and publish. Publishing closes the previous active poll. Results are shown to a visitor only
after they have answered.

## Data model (Firestore)

| Collection | Doc id | Fields | Access |
|---|---|---|---|
| `votes` | uid | candidate, reason (≤240, no URLs), department, priorities[≤3], lang, createdAt, updatedAt | owner write, public read |
| `polls` | auto | week, question{ht,fr,en}, options[{id,label}], startsAt, endsAt, active | admin write, public read |
| `pollVotes` | `{pollId}_{uid}` | pollId, option, lang, updatedAt | owner write, public read |
| `stats` | presidential, poll_{id} | total, counts, reasons, updatedAt | Functions write, public read |

Without Functions, clients aggregate with `count()` queries (1 read per 1,000 docs) and refresh every 45 s.

## Updating content

- Candidates: `src/data/candidates.ts` and the id list in `firestore.rules` + `functions/src/index.ts`.
- Dates: `src/data/dates.ts` (`DATES_UPDATED`, `CONTENT_UPDATED`).
- Photos: drop the licensed original in a folder and run `node scripts/photos.mjs <folder>`; record the license in `public/photos/credits.json` and `photoCredit`.

## Still to verify before publishing

See the checklist in the pull request / hand-over notes: CEP preliminary list (Dec 15, 2026) and final list
(Jan 11, 2027); candidacy status of Jean Ernest Muscadin (inadmissibility report, Oct 29, 2026) and Wilson
Jeudy (withdrawal report, Oct 18, 2026); Kreyòl copy review by a native editor; photo licenses (two are
CC BY-SA, which the credit line satisfies); Firebase Anonymous/Google sign-in enabled.
