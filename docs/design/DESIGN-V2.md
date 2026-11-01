# Prezidan Pa M · DESIGN V2 (premium pass) · implementation spec

Date: 30 oktòb 2026. Source of truth for the front-end re-implementation of the seven mobile screens.
Stitch project `projects/16900759932870491329`, design system `assets/8547351849386836628`.
Final renders and HTML: `final/s1-start … s7-poll (.png + .html)`, ids in `final/manifest.json`.

Read the PNGs for the look, this file for the numbers. Where the Stitch HTML and this spec disagree, this spec wins (section 12 lists every deliberate deviation).

Non-negotiables carried over: palette below and nothing else; one typeface (Bricolage Grotesque); sentence case everywhere; every candidate card identical in format and size; monogram avatars only (photos, if ever, same circular crop for all); no ranking numbers on candidates, only match bars; no flags, vèvè, religious or political symbols, stock photos or illustrations; flag red is the presidential Vote action only; no em dash or en dash anywhere in copy (use `,` `:` or `·`; French quotes « » are fine); 44px minimum touch targets; mobile-first; light enough for 2G.

---

## 1. Color tokens

### 1.1 Light (default)

| Token | Value | Use |
|---|---|---|
| `--indigo` | `#0B1230` | Header bar, hero, monogram avatar fill, sheet backdrop base |
| `--ultra` | `#1A3BB5` | Primary: selected tiles, primary buttons, links, bars, rails, active tab, chips text, radio fill |
| `--ultra-tint` | `#EAEEFA` | Icon wells, chips background, quiet pills, selected rows / options |
| `--ultra-ring` | `#7D93E8` | 2px ring around a selected tile, focus ring on dark surfaces |
| `--red` | `#D41E3C` | Presidential Vote button only (« Vote kounye a », « Vote pou … », « Voye vòt mwen ») |
| `--red-press` | `#B8172F` | Pressed state of the Vote button only |
| `--bg` | `#F3F5FA` | Page background, party pill background, tinted row card, close button fill |
| `--card` | `#FFFFFF` | Cards, sheet, bottom chrome (at 92 percent) |
| `--ink` | `#0B1A4A` | Headings and body text |
| `--muted` | `#5B6480` | Secondary text, captions, inactive tab, chevrons |
| `--hairline` | `#E1E5F0` | Card borders, dividers, bar track in the rail, unselected radio ring |
| `--track` | `#E6EAF5` | Track of match / result bars |
| `--handle` | `#D5DAE8` | Sheet drag handle |
| `--on-indigo-muted` | `#B9C4E6` | Secondary text on indigo (hero lead, « Ayiti 2027 · Vòt pèp la ») |
| `--hero-wash` | `rgba(26,59,181,.45)` | Radial wash, bottom-right of the hero |
| `--scrim` | `rgba(11,18,48,.55)` | Backdrop behind the profile sheet |
| `--chrome` | `rgba(255,255,255,.92)` + `backdrop-filter: blur(12px)` | Bottom nav, action bar, vote bar |

Contrast checks (WCAG): ink on white 15.6:1; muted on white 5.6:1 (AA for 13px); ultramarine on white 7.9:1; ultramarine on tint 6.9:1; white on ultramarine 7.9:1; white on red 5.3:1; `#B9C4E6` on indigo 10.4:1.

### 1.2 Dark (`prefers-color-scheme: dark`, also `[data-theme="dark"]`)

| Token | Dark value | Note |
|---|---|---|
| `--bg` | `#070B1F` | |
| `--card` | `#0F1636` | |
| `--indigo` | `#0B1230` | Header stays; hero becomes `#0B1230` on a `#070B1F` page |
| `--ink` | `#EAF0FF` | |
| `--muted` | `#9AA6C8` | |
| `--hairline` | `#22305E` | |
| `--track` | `#1B2650` | |
| `--ultra` (fills) | `#1A3BB5` | Selected tiles, primary buttons, bars keep the brand fill |
| `--ultra-text` | `#5B7CFF` | Links, chip text, active tab, rail labels (lifted for contrast on dark) |
| `--ultra-tint` | `#16214D` | Wells, chips, selected rows |
| `--ultra-ring` | `#5B7CFF` | |
| `--red` | `#D41E3C` | Unchanged |
| `--handle` | `#2B3A6B` | |
| `--on-indigo-muted` | `#B9C4E6` | Unchanged |
| `--chrome` | `rgba(15,22,54,.92)` + blur | |
| `--scrim` | `rgba(0,0,0,.6)` | |
| Shadows | `0 1px 2px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.35)` | Hairline carries the edge; shadows are mostly invisible on dark and that is fine |
| Monogram avatar | fill `#1A2457`, initials `#EAF0FF`, ring `0 0 0 2px #0F1636, 0 0 0 3px #22305E` | |

Stitch renders light only; the dark set above is the spec.

---

## 2. Typography

Typeface: Bricolage Grotesque (variable: opsz 12..96, wght 200..800). Fallback `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

Loading (the exact axis string matters; the earlier `opsz,wght@12..96,400;500;600;700;800` is invalid and silently falls back to Arial):

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap">
```

Preferred for 2G: self-host one Latin-subset variable woff2 (about 60 to 80 KB) with `<link rel="preload" as="font" type="font/woff2" crossorigin>` and `font-display: swap`. Global rules:

```css
html { font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-optical-sizing: auto; -webkit-font-smoothing: antialiased; }
.num { font-variant-numeric: tabular-nums; }   /* every count, percentage, date, time, counter */
```

Scale (px / weight / line-height / letter-spacing):

| Level | Size | Weight | Line-height | Tracking | Where |
|---|---|---|---|---|---|
| Display | 40 (desktop 56) | 800 | 1.05 | -0.02em | Start hero headline only |
| Headline | 28 | 700 | 1.15 | -0.015em | Page title (Vote, About), candidate name in the sheet |
| Title | 20 | 700 | 1.25 | -0.01em | Section headings, card headings in the sheet and About |
| Body | 16 | 400 | 1.5 | 0 | Paragraphs, leads, inputs, option labels (500) |
| Body strong | 16 | 600 | 1.4 | 0 | Tile labels, field labels, past-poll question |
| Name | 17 | 600 | 1.3 | 0 | Candidate name on cards and rows |
| Label | 14 | 500 | 1.4 | 0 | Match line, note text (400), links in rows (500), bullets (15/400) |
| Caption | 13 | 400 | 1.4 | 0 | Stamps, footers, counters, helper text, pills (500) |
| Nav label | 12 | 500 (active 600) | 1 | 0 | Bottom nav, progress rail |
| Stat | 56 | 800 | 1 | -0.03em | Participant count |
| Question | 22 | 700 | 1.2 | -0.01em | Weekly poll question |
| Percent (card) | 20 | 700 | 1 | 0 | Result percentages |
| Wordmark | 18 | 700 | 1 | -0.01em | « Prezidan Pa M », top-level page names |
| Bar title | 17 | 600 | 1 | 0 | Centered title on drill-in pages |

Rules: sentence case everywhere; no `text-transform: uppercase`, no letter-spaced small caps, no letter-spacing on monogram initials. French quotes: insert a narrow no-break space (U+202F) after « and before » so a closing » never orphans on its own line (Stitch wraps « Mwen vle wout ak dlo nan zòn mwen an. » with the » alone on line 2; do not ship that).

---

## 3. Spacing, radii, shadows, layout

Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96.
- Page gutters 16. Sheet gutters 20. Card padding 16 (stat card, question card, About cards: 20).
- 12 between cards in a list. 24 between blocks. 32 before a new section heading. 16 between a heading and its first card. 8 between poll options. 6 between chips.
- Bottom padding of scroll content: 112 under an action bar or vote bar, 96 under the bottom nav, so nothing hides under the chrome.
- Content max-width 390 on mobile; 720 centered on desktop (tiles become 3 columns at 640, 4 at 960; cards stay single column).

Radii: cards 16; priority tiles 14; option rows and tinted row card 14; inputs, search, select, textarea 12; sheet top 24; pills, chips, buttons, badges, avatars 999.

Shadows:
- Card: `0 1px 2px rgba(11,26,74,.05), 0 4px 12px rgba(11,26,74,.05)` plus `1px solid var(--hairline)`.
- Sheet: `0 -8px 32px rgba(11,18,48,.18)`.
- Bottom chrome: `border-top: 1px solid var(--hairline)` plus `0 -2px 12px rgba(11,26,74,.06)`.
- Buttons: none. No glow, no inner shadows.

Focus: `outline: 2px solid var(--ultra); outline-offset: 2px` on light, `var(--ultra-ring)` on indigo.

---

## 4. Hero texture (Start only)

Faint abstract line lattice inspired by wrought-iron lace, nothing symbolic. Inline SVG, absolutely positioned over the hero, `opacity: .07`, `pointer-events: none`, masked so it fades out before the bottom. Suggested pattern (this is what Stitch shipped and it reads well):

```html
<svg class="hero-lace" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="lace" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M0 28A28 28 0 0 0 28 0M28 0A28 28 0 0 0 56 28M56 28A28 28 0 0 0 28 56M28 56A28 28 0 0 0 0 28"
            fill="none" stroke="#fff" stroke-width="1"/>
      <circle cx="28" cy="28" r="6" fill="none" stroke="#fff" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#lace)"/>
</svg>
```

```css
.hero { position: relative; background: #0B1230; overflow: hidden; }
.hero::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 100% 100%, rgba(26,59,181,.45), transparent 70%); }
.hero-lace { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .07;
  -webkit-mask-image: linear-gradient(to bottom, #fff 20%, transparent 100%);
          mask-image: linear-gradient(to bottom, #fff 20%, transparent 100%); }
```

Keep the opacity between .06 and .08; it should be felt, not seen. The texture is 300 bytes, no image request. Nowhere else on the site.

---

## 5. Components

Every dimension is CSS px at 1x. Touch targets never below 44 x 44.

### 5.1 Header
- Height 56 + `env(safe-area-inset-top)`, background `--indigo`, text white. Horizontal padding 16.
- Top-level pages (Start, Rezilta, Sondaj): wordmark or page name at left, 18/700 white; Start adds the `how_to_vote` icon 22px before the wordmark.
- Drill-in pages (Kandida yo, Vote, Kijan sa mache): back arrow in a 44 x 44 target at left (`-8px` margin so the glyph aligns to the gutter), centered title 17/600 white.
- Language pill at right: « Kreyòl ▾ », height 32, padding 0 12, 13/500 white, `1px solid rgba(255,255,255,.3)`, transparent fill, radius 999. Opens a menu: « Kreyòl », « Français », « English ». Same pill on every screen.
- Start only: a 32px strip under the bar on the same indigo with « Ayiti 2027 · Vòt pèp la » 13/400 `--on-indigo-muted`, centered, and a 1px `rgba(255,255,255,.08)` line above it.

### 5.2 Progress rail (inner pages: Kandida yo, Vote, Rezilta)
- Directly under the header on the page background; padding 12 16 12.
- Four equal segments, height 3, gap 4, radius 999. Labels 12/500 centered under each segment, 6px below: « Priyorite », « Kandida », « Vote », « Rezilta ».
- Completed: segment `--ultra`, label `--ink`. Current: segment `--ultra`, label `--ultra` 600. Upcoming: segment `--hairline`, label `--muted`.
- States shipped: Kandida yo = [done, current, up, up]; Vote = [done, done, current, up]; Rezilta = [done, done, done, current].
- Each segment + label is a link to that step when the step is reachable (44px tall hit area). Not shown on Start, the sheet, About or Sondaj. (The brief said "5-step"; the four labels listed are the whole flow, so the rail has four segments.)

### 5.3 Priority tile (Start)
- 2-column grid, gap 12, min-height 120, equal heights per row; padding 14; radius 14; `button` with `aria-pressed`.
- Unselected: white, 1px `--hairline`, card shadow. Icon in a 40px circular well `--ultra-tint`, icon 22px `--ultra` (outlined, weight 300). Label bottom-left 16/600 `--ink`, line-height 1.25, max 2 lines.
- Selected: fill `--ultra`, border `--ultra`, ring `box-shadow: 0 0 0 2px var(--ultra-ring)`, well `rgba(255,255,255,.16)` with white icon, white label, and a rank badge: 24px white circle top-right (top 12, right 12), numeral 13/700 `--ultra` tabular, showing the order tapped (1, 2, 3).
- Max 3. When 3 are selected, every unselected tile goes to `opacity: .6` (icon well and label included) and stays tappable only to show a 2-second toast « Ou gen 3 priyorite deja. Retire youn pou chanje. » (suggested copy, not in Stitch). Deselecting renumbers the remaining badges in order.
- Press: `transform: scale(.98)` 100ms. Hover (pointer devices only): border `--ultra-ring`. No hover elsewhere on the page.

### 5.4 Counter pill (Start section header)
« {n} chwazi sou 3 », height 28, padding 0 10, 13/500 `--muted` tabular on white, 1px `--hairline`, radius 999. Right-aligned to « Domèn priyoritè yo » (title 20/700).

### 5.5 Candidate card (Kandida yo, Rezilta; compact variant on Kandida yo)
- White card, radius 16, hairline, card shadow, padding 16, 12 between cards. Identical height for every card of the same variant.
- Row: avatar 52 (see 5.6), 12 gap, name 17/600 `--ink` (1 line, ellipsis), party pill under the name (4px gap), chevron `chevron_right` 20px `--muted` at the far right (the whole card is one link / button to the profile sheet).
- Match block (12 below the row, matched variant only): line « {m} sou 3 priyorite w yo » 14/500 `--ink`; 8 below, a bar 6 tall, radius 999, track `--track`, fill `--ultra` at m/3 width; 10 below, chips (5.7) of the matched priorities in the visitor's own order. When m = 0 the bar stays empty and instead of chips: « Okenn nan 3 priyorite w yo pa idantifye nan dosye piblik li. » 13/400 `--muted` (not italic).
- Compact variant (section « Pwogram poko pibliye »): row only, same avatar, name, pill and chevron; height 84.
- Result variant (Rezilta): row plus the percentage at the far right (20/700 `--ink` tabular, « 23 % » with a normal space before %), no chevron; 12 below the row an 8px bar (track `--track`, fill `--ultra`, width = percentage). The visitor's own choice adds an inner left rail `border-left: 3px solid var(--ultra)` (card keeps its hairline and size; the radius clips the rail) and the « Chwa w » pill (5.8) right after the name. No outline box, no bigger size, no reordering by the visitor.
- Order: random on every load on Kandida yo within each section; Rezilta is sorted by share (that is the one list where order carries meaning, and the note above it says so).
- Never a number before a name, never a trophy or medal, never a party color.

### 5.6 Monogram avatar
- 52px circle (sheet: 64; nav / compact contexts never smaller than 44 on Start-like lists), fill `--indigo`, initials 17/700 white (64px: 22/700), no letter-spacing, centered.
- Ring: `box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--hairline)` (reads as a 2px white ring with a hairline outside it on a white card).
- Initials: first letter of first and last name; two letters, no diacritics. If photos are ever used: same circle, same size, `object-fit: cover`, grayscale with an indigo duotone, same ring, for every candidate or for none.

### 5.7 Chip (matched priority)
Height 28, padding 4 10, 13/500 `--ultra` on `--ultra-tint`, radius 999, gap 6, wraps. Not interactive on cards. The numbered variant (summary card on Kandida yo) prefixes an 18px `--ultra` circle with the white numeral 11/700.

### 5.8 Pills
- Party pill: 12/500 `--muted` on `--bg`, 1px `--hairline`, padding 2 8, height 22, radius 999, max-width 100 percent with ellipsis (« Ayiti Transfòme », « VAR · Vision-Action-Réalisation »).
- « Chwa w » pill: `check` icon 14px + 13/600 `--ultra` on `--ultra-tint`, padding 3 10, height 26.
- Week pill (Sondaj): 6px `--ultra` dot + « Semèn 44 · 26 okt jiska 1 nov 2026 » 13/500 `--ultra` tabular on `--ultra-tint`, height 30, padding 0 12.
- Counter pill: see 5.4.

### 5.9 Buttons
| Kind | Height | Type | Colors | Icon | Used for |
|---|---|---|---|---|---|
| Primary | 48 | 16/600 | white on `--ultra`; press `#162F93` | optional, 20px, 8 gap | « Wè kandida yo » (arrow_forward), « Voye repons mwen » (check_circle), « Pataje sou WhatsApp » / « Pataje » (share) |
| Vote (red) | 52 | 17/700 | white on `--red`; press `--red-press` | `how_to_vote` 22px | « Vote kounye a », « Vote pou Wilson Jeudy », « Voye vòt mwen » only |
| Secondary | 48 | 15/600 | `--ultra` text, 1px `--ultra` border, transparent | link 20px | « Kopye lyen » |
| Text link | 44 target | 15/600 | `--ultra` | optional | « Chanje », « Wè tout 16 kandida yo », « + 9 lòt kandida » (expand_more) |
| Icon button | 40 or 44 | | `--bg` fill, `--ink` icon | close, arrow_back | sheet close, header back |

All pills radius 999, horizontal padding 20 (icon buttons none). Disabled: opacity .4, no pointer. Press: `scale(.98)` 100ms. No shadows, no gradients. Share pills: WhatsApp pill `flex: 1`, copy pill auto width, `white-space: nowrap`, 15/600, padding 0 16; if the two cannot fit in the gutter width (358), stack them full width with a 12 gap (never truncate the label).

### 5.10 Bottom navigation (Start before any pick, Rezilta, Sondaj)
- `position: fixed; bottom: 0`, height 64 + `env(safe-area-inset-bottom)`, background `--chrome` with `backdrop-filter: blur(12px)` (fallback: solid `--card`), 1px `--hairline` top, chrome shadow.
- Four equal tabs: « Priyorite » (`tune`), « Kandida » (`groups`), « Rezilta » (`how_to_vote`), « Sondaj » (`ballot`). Each: 3px indicator slot, icon 24px, label 12/500, `--muted`, vertical stack centered, full height tappable.
- Active: icon and label `--ultra`, label 600, and a 20 x 3 `--ultra` pill (radius 999) centered 6px above the icon. Icons stay outlined (never filled) in every state.
- No hover styles. Press: `scale(.96)` on the icon only, 100ms. `aria-current="page"` on the active tab.
- Kandida yo, Vote, the profile sheet and Kijan sa mache do not show the nav (flow pages carry their own bottom bar; About is a drill-in page with the back arrow).

### 5.11 Sticky action bar (Start after the first pick, Kandida yo)
- Same surface as the nav (`--chrome`, blur, hairline top, chrome shadow), padding 12 16 + safe area, `position: fixed; bottom: 0`.
- Left: two lines, 15/600 `--ink` over 13/400 `--muted`. Right: a pill button, min-width 160.
- Start: « 2 sou 3 priyorite » / « Ou ka chwazi youn ankò » + primary « Wè kandida yo » (arrow_forward). Shipped copy covers the 2-pick state; suggested copy for the other states (validate with the content owner): 1 pick « 1 sou 3 priyorite » / « Ou ka chwazi 2 ankò »; 3 picks « 3 sou 3 priyorite » / « Ou ka chanje chwa w ».
- Kandida yo: « Pare pou vote? » / « Yon vòt pa moun » + Vote (red) « Vote kounye a » (how_to_vote), 52 tall.
- On Start the bar replaces the nav the moment the first tile is selected (nav fades out 160ms, bar slides up 240ms) and the nav returns when the last tile is deselected.

### 5.12 Vote bar (Vote page, profile sheet)
Same surface. Vote page: full-width red « Voye vòt mwen » 52, padding 12 16 + safe area. Sheet: red « Vote pou {Non} » 52 then the centered note « Yon vòt pa moun · Ou ka chanje l nenpòt lè » 13/400 `--muted` 8 below, padding 12 20 and 16 + safe area at the bottom; `position: sticky; bottom: 0` inside the sheet's scroll container.

### 5.13 Profile bottom sheet
- Backdrop `--scrim` over the page (page content behind is inert, `aria-hidden`), tap on the backdrop closes.
- Sheet: white, top radius 24, sheet shadow, top at 96px from the viewport top (so the header and the page title peek through), height = min(content, 100vh - 96) with internal scrolling, `role="dialog"`, `aria-modal`, focus trapped, Escape closes.
- Drag handle 36 x 4 `--handle`, radius 999, centered, 8 from the top; dragging down more than 120px or faster than 0.5 px/ms dismisses.
- Close button 40px circle `--bg` fill with `close` 22px `--ink`, top 12 right 20.
- Gutters 20. Identity block: avatar 64 at left, 16 gap; name 28/700 `--ink`, party pill (12/500) 8 below, role line « Majistra Delmas depi 2006 » 14/400 `--muted` 6 below. Hairline 20 above and below.
- Section heading: title 20/700 `--ink` with `border-left: 3px solid var(--ultra); padding-left: 12px`. 24 between sections, 12 heading-to-content.
- Byografi paragraph 16/400 line-height 1.6. Record rows: 6px `--ultra` dot at x=3, text 15/400 `--ink`, 10 between rows.
- Tinted row card (« Priyorite li pale sou yo »): `--bg`, 1px hairline, radius 14, padding 14; 40px white circular well with the priority icon 22px `--ultra`; title 16/600, description 14/400 `--muted`. One card per priority the record documents; caption 13/400 `--muted` under the list.
- « Sous » link rows: 56 tall, hairline between rows, label 15/500 `--ultra`, date 13/400 `--muted` tabular under the label, `arrow_outward` 20px `--muted` at the right; whole row is the link (`target="_blank" rel="noopener"`).
- Bottom: 24 space, then the vote bar (5.12). Nothing may sit under the bar.

### 5.14 Inputs (Vote page)
- Search: 48 tall, radius 12, white, hairline, `search` 22px `--muted` at left (padding-left 44), placeholder 16/400 `--muted` « Chèche yon kandida ». Focus: 2px `--ultra` border.
- Candidate radio list: one white card (radius 16, hairline, shadow) with rows 72 tall, padding 0 16, hairline between rows, avatar 52, name 17/600, party pill, radio 22 at the right (unselected: 2px `--hairline` ring; selected: 2px `--ultra` ring + 10px `--ultra` dot). Selected row: `--ultra-tint` background and an inner `border-left: 3px solid var(--ultra)`. Use real `<input type="radio" name="kandida">` with the row as its label. Last row: text button « + 9 lòt kandida » with `expand_more`, 48 tall, centered; expands in place.
- Textarea: 96 tall min, radius 12, hairline, padding 12, 16/400, placeholder « Yon fraz sou rezon w… », counter « 0 / 240 » 13/400 `--muted` tabular top-right, maxlength 240.
- Select: 48 tall, radius 12, hairline, 16/400 `--ink`, `expand_more` at right; helper 13/400 `--muted` 8 below.
- Field label: 16/600 `--ink` with « opsyonèl » 13/400 `--muted` 8 to the right on the same baseline.
- Note cards (lock, info): white card, padding 16, icon 20px `--muted` at left, text 14/400 `--muted`, line-height 1.5.

### 5.15 Match bar and result bar
- Match bar: 6 tall, radius 999, track `--track`, fill `--ultra`, width m/3.
- Result bar: 8 tall, same colors, width = percentage. Poll result bar: 8 tall, inside a card, label 15/500 at left and « 46 % » 15/700 tabular at right, bar 8 below the label row, 16 between rows.
- Bars grow from 0 on first visibility (section 6). Minimum visible fill 4px when the value is above 0.

### 5.16 Quote card (Rezilta, « Dènye rezon yo »)
White card, radius 16, hairline, shadow, padding 16; quote 16/500 `--ink` line-height 1.5 wrapped in « » with narrow no-break spaces; footer 13/400 `--muted` 8 below: « Anonim · {depatman} · {tan} ». No avatar, no like button, no reply.

### 5.17 Stat block (Rezilta)
White card, padding 20. « 12 384 » 56/800 tabular `--ink` tracking -0.03em with « moun patisipe » 16/400 `--muted` on the same baseline (`align-items: baseline`, 8 gap); thin-space thousands separator (U+2009) as in the copy. « Dènye mizajou: jodi a, 14:05 » 13/400 `--muted` tabular 6 below. Hairline 16 above and below. Info row: `info` 20px `--muted` + 14/400 `--muted` text.

### 5.18 Timeline (Kijan sa mache)
Vertical 2px `--hairline` line at x=5 inside the card; entries 24 apart; dot = 10px circle, 2px `--ultra` ring, white center, centered on the line; date 15/600 `--ink` tabular; label 14/400 `--muted` 2 below. After the last entry: hairline, then a caption row with `info` 18px `--muted` and 13/400 `--muted` text.

### 5.19 Poll option row (Sondaj)
Min height 56, radius 14, white, 1px `--hairline`, padding 0 16, radio 22 at left (2px `--hairline` ring), label 16/500 `--ink`, 8 between rows. Selected: `--ultra-tint` fill, 2px `--ultra` border, radio filled (ring + 10px dot). Real radio inputs. After submit the question card collapses to the results card with « Chwa w » on the chosen row and the submit button becomes a disabled « Repons voye » (suggested copy).

### 5.20 Link rows (About « Sous »)
52 tall, hairline between, label 15/500 `--ultra` (wraps to 2 lines if needed), `open_in_new` 20px `--muted` at right, whole row tappable.

### 5.21 Icons
Material Symbols Outlined, weight 300, optical size 24, never filled. Used set: how_to_vote, shield, school, add_road, work, ecg_heart, agriculture, balance, bolt, flight_takeoff, nature, group, groups, tune, ballot, history_edu, construction, info, lock, search, check, check_circle, chevron_right, expand_more, arrow_forward, arrow_back, arrow_outward, open_in_new, close, share, link. Ship them as an inline SVG sprite (about 6 KB), not the icon font (the font Stitch loads is 200 KB+ and blocks on 2G).

---

## 6. Motion

Easing tokens: `--ease-out: cubic-bezier(.16, 1, .3, 1)`; `--ease-standard: cubic-bezier(.2, .7, .2, 1)`; `--ease-sheet: cubic-bezier(.32, .72, 0, 1)`.

| Moment | Spec |
|---|---|
| Page reveal (once per page load) | Main content `opacity 0 → 1`, `translateY(10px) → 0`, 450ms `--ease-out`. On Start the hero reveals first, then tiles stagger 30ms each (12 tiles, 360ms total). Header and bottom chrome do not animate. Nothing else animates on load. |
| Tile select / deselect | background, color, box-shadow 150ms `--ease-standard`; rank badge `scale(.8) → 1` + fade 180ms `--ease-out`. |
| Third pick dims the rest | opacity → .6, 200ms. |
| Nav ↔ action bar swap (Start) | nav fades 160ms; bar `translateY(100%) → 0` 240ms `--ease-standard`. |
| Sheet open / close | translateY 320ms `--ease-sheet`; scrim opacity 200ms; drag follows the finger 1:1, release animates to the nearest end. |
| Bars (match, result, poll) | width 0 → value, 600ms `--ease-standard`, 60ms stagger, triggered once by IntersectionObserver at 20 percent visibility. |
| Radio / option select | background and border 120ms. |
| Button press | `scale(.98)` 100ms; release 160ms. |
| Copy link | toast « Lyen kopye » (suggested copy) slides up 200ms, stays 2s. |
| Reduced motion (`prefers-reduced-motion: reduce`) | every transform animation removed; opacity changes 120ms max; bars render at their final width; sheet appears without sliding. |

No hover effects on cards, rows, chips or nav; hover only on buttons and tiles (pointer devices).

---

## 7. Performance budget (2G)

- HTML + CSS per page under 30 KB gzipped; no CSS framework at runtime (compile Tailwind or hand-write tokens).
- Fonts: one Latin-subset variable woff2 (60 to 80 KB) preloaded, `font-display: swap`; metric-matched fallback via `size-adjust` to avoid layout shift.
- Icons: inline SVG sprite, no icon font. Hero texture: inline SVG pattern, no image.
- No images on any of the seven screens. Avatars are text.
- Bars and reveals are CSS transitions; one small IntersectionObserver script.
- Results and poll data: one JSON fetch, cached, with the « Dènye mizajou » stamp from the payload.

---

## 8. Accessibility

- Tiles: `button[aria-pressed]`, rank badge in `aria-label` (« Sekirite, priyorite 1 »).
- Candidate radios, poll radios: native inputs, labels are the rows.
- Bars: `role="progressbar"` or `meter` with `aria-valuenow` and a text alternative (« 2 sou 3 priyorite w yo » already is one).
- Sheet: `dialog`, focus trap, Escape, return focus to the card that opened it.
- Bottom nav: `nav[aria-label="Navigasyon prensipal"]`, `aria-current="page"`.
- Focus rings 2px `--ultra`, offset 2 (ring `--ultra-ring` on indigo).
- All text meets AA at its size (section 1.1); muted 13px text is used only for secondary information.

---

## 9. Screen walkthroughs (exact strings)

Strings are the ones in the final HTML. Icons in parentheses.

### 9.1 Start · `final/s1-start`
1. Header: (how_to_vote) « Prezidan Pa M » · pill « Kreyòl ▾ ». Strip: « Ayiti 2027 · Vòt pèp la ».
2. Hero (indigo, lace texture, radial wash; padding 32 16 40): display « Kisa w ta vle chanje an Ayiti? » (wraps « Kisa w ta vle / chanje an Ayiti? » at 390); lead « Chwazi jiska 3 priyorite, nan lòd ki pi enpòtan pou ou. Apre sa, n ap montre w kandida ki gen dosye piblik sou yo. »
3. Section row (24 below the hero): « Domèn priyoritè yo » · counter pill « 2 chwazi sou 3 ».
4. Grid, 12 tiles in this order: « Sekirite » (shield) · « Lekòl ak edikasyon » (school) · « Wout ak enfrastrikti » (add_road) · « Travay ak ekonomi » (work) · « Lasante » (ecg_heart) · « Agrikilti ak manje » (agriculture) · « Jistis ak koripsyon » (balance) · « Kouran ak dlo » (bolt) · « Dyaspora » (flight_takeoff) · « Anviwònman ak katastwòf » (nature) · « Eleksyon ak enstitisyon » (how_to_vote) · « Jèn yo » (group). Shipped state: Sekirite = 1, Lekòl ak edikasyon = 2.
5. Info card (24 below): (info) « Prezidan Pa M se yon inisyativ sivik endepandan. Klasman an se pa yon rekòmandasyon ofisyèl. Se yon vòt konsyans pèp la ki baze sèlman sou pwogram piblik kandida yo. »
6. Action bar: « 2 sou 3 priyorite » / « Ou ka chwazi youn ankò » · primary « Wè kandida yo » (arrow_forward). Before any pick: bottom nav with « Priyorite » active instead.

### 9.2 Kandida yo (match) · `final/s2-match`
1. Header: back · « Kandida yo » · « Kreyòl ▾ ». Rail: Priyorite done, Kandida current.
2. Summary card: « Priyorite w te chwazi yo » · link « Chanje »; numbered chips « 1 Sekirite », « 2 Lekòl ak edikasyon », « 3 Travay ak ekonomi ».
3. Note card: (info) « Klasman sa a se pa yon rekòmandasyon. Li baze sèlman sou dosye piblik chak kandida: pòs li okipe, aksyon ki dokimante, pwogram li pibliye. »
4. Section row: « Kandida ki gen dosye sou priyorite w yo » · « 4 kandida ».
5. Cards: « Michel Joseph Martelly » · « Debloke » · « 2 sou 3 priyorite w yo » · chips « Sekirite », « Lekòl ak edikasyon » / « Jean Ernest Muscadin » · « FCN » · « 1 sou 3 priyorite w yo » · « Sekirite » / « Wilson Jeudy » · « VAR » · « 1 sou 3 priyorite w yo » · « Travay ak ekonomi » / « Claude Joseph » · « EDE » · « 0 sou 3 priyorite w yo » · « Okenn nan 3 priyorite w yo pa idantifye nan dosye piblik li. »
6. Section: « Pwogram poko pibliye » · lead « Kandida sa yo anrejistre nan CEP men yo poko pibliye pwogram yo. Ou ka toujou vote pou yo. » Compact cards: « Maxo Joseph » · « RCH » / « Ricardo Jean-Pierre » · « PANAH » / « Wilner Joseph » · « Viktwa » / « Gandhy Dorfeuille » · « ANF ».
7. Action bar: « Pare pou vote? » / « Yon vòt pa moun » · Vote (red) « Vote kounye a » (how_to_vote). No percentages anywhere on this page.

### 9.3 Pwofil kandida (sheet) · `final/s3-profile`
Behind the scrim: header « Prezidan Pa M » · « Kreyòl ▾ », page title « Kandida yo », subtitle « Konpare pwogram ak priyorite 12 kandida yo ».
Sheet: handle · close · avatar « WJ » · « Wilson Jeudy » · pill « VAR · Vision-Action-Réalisation » · « Majistra Delmas depi 2006 » · hairline.
- « Byografi »: « Wilson Jeudy se majistra komin Delmas depi 2006. Li konn pou travay sou wout, kanal drenaj, mache piblik ak espas piblik nan komin nan. »
- « Sa dosye piblik la di »: « Majistra Delmas, 2006 jiska jodi a » · « Rekonstriksyon wout ak kanal drenaj nan Delmas » · « Reyamenajman mache piblik ak plas piblik ».
- « Priyorite li pale sou yo »: tinted row (construction) « Wout ak enfrastrikti » · « Wout, drenaj ak mache piblik nan Delmas depi 2006 »; caption « Pa gen dosye piblik sou lòt priyorite yo. Nou pa envante pozisyon. »
- « Sous »: « Haiti Policy House · Election tracker » · « 30 okt 2026 » (arrow_outward) / « CEP · Lis pwovizwa kandida yo » · « 30 okt 2026 » (arrow_outward).
- Vote bar: « Vote pou Wilson Jeudy » (how_to_vote) · « Yon vòt pa moun · Ou ka chanje l nenpòt lè ».

### 9.4 Vote · `final/s4-vote`
1. Header: back · « Vote » · « Kreyòl ▾ ». Rail: Priyorite, Kandida done, Vote current.
2. Headline « Ki moun ou vle kòm prezidan? » · lead « Ou ka vote pou nenpòt kandida, pa sèlman sa ki matche priyorite w yo. Yon vòt pa moun; ou ka chanje l. »
3. Search « Chèche yon kandida ».
4. List card rows: « Wilson Jeudy » · « VAR » (selected) / « Michel Joseph Martelly » · « Debloke » / « Claude Joseph » · « EDE » / « Jocelerme Privert » · « Ayiti Transfòme » / « Gary Bodeau » · « Rekonsilye » / « Jean Ernest Muscadin » · « FCN » / « Maxo Joseph » · « RCH » / text button « + 9 lòt kandida » (expand_more).
5. Card « Poukisa? » « opsyonèl » · « 0 / 240 » · textarea « Yon fraz sou rezon w… ».
6. Card « Depatman w » « opsyonèl » · select « Lwès » · helper « 10 depatman + Dyaspora, oswa « Mwen pito pa di » ».
7. Note card: (lock) « Nou kenbe sèlman yon nimewo telefòn chifre pou garanti yon vòt pa moun. Rezon w yo piblik men anonim. »
8. Vote bar: « Voye vòt mwen » (how_to_vote), full width.

### 9.5 Rezilta · `final/s5-results`
1. Header: « Rezilta » · « Kreyòl ▾ ». Rail: Priyorite, Kandida, Vote done, Rezilta current.
2. Stat card: « 12 384 » « moun patisipe » · « Dènye mizajou: jodi a, 14:05 » · hairline · (info) « Sa a se yon vòt pèp la. Se pa yon sondaj syantifik ni yon prediksyon rezilta eleksyon an. »
3. « Kandida yo, dapre vòt yo »: « Wilson Jeudy » · « VAR » · « Chwa w » · « 23 % » (left rail) / « Jean Ernest Muscadin » · « FCN » · « 19 % » / « Michel Joseph Martelly » · « Debloke » · « 17 % » / « Claude Joseph » · « EDE » · « 11 % » / « Jocelerme Privert » · « Ayiti Transfòme » · « 8 % » / « Gary Bodeau » · « Rekonsilye » · « 6 % » / « Lòt kandida » (avatar « LK ») · « Platfòm divès » · « 16 % ». Link « Wè tout 16 kandida yo » (arrow_forward).
4. « Dènye rezon yo »: « Mwen vle wout ak dlo nan zòn mwen an. » · « Anonim · Lwès · 2 min » / « Sekirite anvan tout bagay, san sa pa gen lekòl. » · « Anonim · Latibonit · 14 min » / « Yon moun ki gen eksperyans nan administrasyon. » · « Anonim · Nò · 42 min » (Stitch varied the demo footers; the original had « Anonim · Lwès · 2 min » three times; real data replaces both).
5. Share row: « Pataje sou WhatsApp » (share) · « Kopye lyen » (link). Footer « Prezidan Pa M · Ayiti 2027 · Kijan sa mache » (last part is the link to About).
6. Bottom nav, « Rezilta » active.

### 9.6 Kijan sa mache · `final/s6-about`
1. Header: back · « Kijan sa mache » · « Kreyòl ▾ ». No rail, no nav.
2. « Yon zouti net, pou pèp la. » · « Prezidan Pa M pa sipòte okenn kandida ni pati. Nou montre sèlman sa ki nan dosye piblik. »
3. Card « Metòd »: (tune) « Ou chwazi jiska 3 priyorite. » / (history_edu) « Nou konte konbyen nan priyorite w yo chak kandida gen yon dosye piblik sou li: pòs li okipe, aksyon ki dokimante, pwogram li pibliye. » / (how_to_vote) « Ou vote pou nenpòt kandida. Yon vòt pa moun, verifye ak yon nimewo telefòn chifre. »
4. Card « Règ netralite »: « Menm fòma ak menm gwosè kat pou chak kandida. » · « Lòd kandida yo chanje chak fwa ou louvri sit la. » · « Pa gen foto pati, pa gen koulè pati, pa gen piblisite, pa gen lajan kandida. » · « Lè yon kandida poko pibliye pwogram, nou di « Pwogram poko pibliye », nou pa devine. » · « Nou montre dènye rezilta yo, nou pa pouse w vote pou pèsonn. »
5. Card « Dat enpòtan (kalandriye CEP, mizajou 28 okt 2026) »: « 11 janvye 2027 » « Lis final kandida yo » / « 20 me 2027 » « Fèmti lis elektoral la » / « 18 jiyè 2027 » « Premye tou » / « 4 oktòb 2027 » « Dezyèm tou »; caption (info) « Dat sa yo deja chanje plizyè fwa. Tcheke CEP pou dènye vèsyon an. »
6. Card « Sous »: « Haiti Policy House · Haiti election tracker » / « Conseil Électoral Provisoire (CEP) » / « BINUH · Rapò Nasyonzini » (open_in_new).
7. Footer: « Dènye mizajou: 30 oktòb 2026 » · « Vèsyon demo · Done yo sou Firebase ».

### 9.7 Sondaj semèn nan · `final/s7-poll`
1. Header: « Sondaj semèn nan » · « Kreyòl ▾ ». No rail.
2. Week pill « Semèn 44 · 26 okt jiska 1 nov 2026 » · lead « Chak semèn, yon nouvo kesyon. Rezilta yo piblik. »
3. Question card: « Nan 100 premye jou yo, ki sa nouvo prezidan an ta dwe fè an premye? » · options « Retabli sekirite nan Pòtoprens » / « Relouvri lekòl ki fèmen yo » (selected) / « Yon plan ijans pou kouran ak dlo » / « Yon gouvènman inite nasyonal » · primary « Voye repons mwen » (check_circle). Ultramarine, never red.
4. Section row « Rezilta pou kounye a » · « 3 912 repons ». Card rows: « Retabli sekirite » « 46 % » / « Relouvri lekòl yo » « Chwa w » « 24 % » / « Kouran ak dlo » « 18 % » / « Gouvènman inite » « 12 % »; hairline; (info) « Sondaj sa a reprezante vwa moun ki patisipe yo sou platfòm nan. Li pa yon sondaj syantifik ofisyèl. »
5. « Semèn pase yo »: « Semèn 43 » · « Ki pi gwo pwoblèm nan zòn ou an? » · (check) « Sekirite · 58 % » · « 4 210 vòt » / « Semèn 42 » · « Èske w ap enskri pou vote? » · (check) « Wi, deja enskri · 41 % » · « 3 845 vòt ».
6. Share row « Pataje » (share) · « Kopye lyen » (link). Bottom nav, « Sondaj » active.

---

## 10. Bottom chrome matrix

| Screen | Rail | Bottom chrome |
|---|---|---|
| Start | no | Nav (Priyorite active) until the first pick, then the action bar |
| Kandida yo | Priyorite done · Kandida current | Action bar with red « Vote kounye a » |
| Pwofil (sheet) | no | Vote bar inside the sheet |
| Vote | Priyorite, Kandida done · Vote current | Vote bar « Voye vòt mwen » |
| Rezilta | all done · Rezilta current | Nav (Rezilta active) |
| Kijan sa mache | no | none (back arrow in the header) |
| Sondaj | no | Nav (Sondaj active) |

---

## 11. Checklist status (final renders)

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Typographic authority, 4-level scale, tabular numerals | Pass | s1 display 40/800/-0.02em; valid font link on all 7 (round 1 had Arial fallback on 6 screens, fixed in round 2 and 3) |
| 2 | Depth with restraint, 16/14/24 radii, hero texture + wash | Pass | lace pattern at .07 masked, radial wash; cards hairline + 2-layer shadow |
| 3 | Signature grid: wells, selected fill + ring + badge, dim at 3 | Pass (dim state specified, not rendered: the shipped state has 2 picks) | s1 |
| 4 | Progress rail on inner pages | Pass (4 segments) | s2, s4, s5 |
| 5 | Candidate cards 52 avatar + ring, 17/600, party pill, 6px bar, chips; own choice rail + « Chwa w » | Pass | s2, s4, s5 |
| 6 | Bottom nav 92 percent blur, hairline, pill indicator; action bar on Start | Pass (nav label 11px in Stitch, spec 12; active icon filled in Stitch, spec outlined) | s5, s7, s1 |
| 7 | Sheet: 24 radius, handle, 20 gutters, rails, « Sous » rows, fixed red Vote + note | Pass | s3 |
| 8 | Results: oversized count, stamp, bars, quote cards, WhatsApp + copy pills | Pass | s5 |
| 9 | Quiet: no hover everywhere, one reveal, whitespace | Pass with deviations (Stitch left hover on nav tabs and pills; drop them) | all |
| 10 | Dark mode tokens | Specified (section 1.2) | this file |
| Brand | Palette only, no dashes, sentence case, no photos, red only on Vote | Pass | HTML audit: 0 visible dashes, 0 uppercase classes, 0 img, red on s2 s3 s4 only, gradients on s1 only |

---

## 12. Where the implementation must deviate from the Stitch HTML

1. Icon font: Stitch loads Material Symbols as a web font (`fill-1` on the active nav icon, 200 KB+). Ship an inline SVG sprite, keep every icon outlined, including the active tab.
2. Nav labels: Stitch uses 11px and 22px icons; use 12px labels and 24px icons, and remove `hover:text-…` and `active:scale-95` from tabs (press feedback on the icon only, 100ms).
3. Hover: Stitch adds `hover:bg-white/10` on the language pill and hover colors on links; hover is allowed on buttons and tiles only (pointer media query), nothing else.
4. Sheet bar: Stitch ships `bg-white/95`; use the shared chrome token (92 percent + blur). Stitch's sheet is a flowing document (so the screenshot shows all of it); the real sheet is a dialog with internal scroll and the vote bar sticky at its bottom (5.13).
5. Font link: s6-about still uses the `400..800` range form (valid, but no 200 to 300). Use the single shared link / self-hosted subset everywhere.
6. Closing guillemets: add narrow no-break spaces inside « » (section 2); Stitch orphaned a » in the first quote card.
7. Start headline wrap: Stitch uses `max-width: 12ch`; keep a `text-wrap: balance` fallback so the two lines stay balanced at other widths.
8. Results quote footers: Stitch invented « Latibonit · 14 min » and « Nò · 42 min » for variety; both come from data in the real app.
9. The counter pill, chips and rank badges in Stitch sometimes lack `tabular-nums`; apply `.num` to every numeral.
10. Stitch screen titles inside the Stitch project still carry an em dash (metadata only); the HTML `<title>` tags are correct: « Prezidan Pa M · … ».
11. Remove Stitch's `selection:bg-ultramarine` styling only if it conflicts with the red button text; otherwise keep (harmless).
12. Stitch's Tailwind CDN build must not ship; compile tokens to plain CSS custom properties (section 1) so dark mode can switch by media query and attribute.
13. Suggested copy not present in Stitch and to be validated by the content owner before use: the 1-pick and 3-pick action-bar lines, the 3-pick toast, « Repons voye », « Lyen kopye ».
