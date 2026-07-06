# PRD — «Большой русскоязычный пикник» event microsite

**Owner:** BesedaTech
**Status:** Draft v0.1 (for review)
**Type:** One-off, mobile-first single-page app (SPA), static hosting, content driven by JSON.
**Last updated:** 2026-07-05

---

## 1. Summary

A lightweight, mobile-first landing page for a single community event — **«Большой русскоязычный пикник»**. It shows the headline event details, a scrollable day timeline of sub-events (with a glanceable full-day overview), tappable event cards with full details and organizer links, and a partners/sponsors section. Visitors can add individual events (or the whole day) to their personal calendars. The footer carries a **"Powered by BesedaTech"** mark with a soft call-to-action inviting others to build their own event pages with us.

It is a **static site**: no backend, no accounts, no admin panel. All content lives in a handful of JSON files that a non-developer can edit.

---

## 2. Goals & non-goals

### Goals
- Give attendees a fast, clear, phone-friendly way to see **what's happening, when, for whom, and where**.
- Make it effortless to **save events to a personal calendar**.
- Showcase **partners/sponsors** attractively and drive clicks to them.
- Act as a **BesedaTech showcase** — a polished reference others can point at, with a CTA.
- Be **trivially editable** (JSON) and **cheap to host** (static CDN).

### Non-goals (v1)
- No user accounts, login, or profiles.
- No CMS / admin UI (content is edited in JSON).
- No payments or ticketing.
- No real-time backend, chat, or live updates beyond a client-side clock.
- Not a reusable multi-event platform yet (though the JSON structure keeps that door open).

---

## 3. Target users

- **Attendees & families** browsing on a phone before and during the event — the primary audience. Many are parents deciding which kids' activities to catch.
- **Community members** interested in a specific track (games, AI, kids).
- **Partners/sponsors** who want to see their placement.
- **BesedaTech prospects** who land here and notice the footer CTA.

Design bias: **mobile-first, on-the-go, low-friction.** Most sessions are short, one-handed, possibly on flaky mobile data at the venue.

---

## 4. Scope (v1)

A single page composed of five stacked sections, plus a day-of live element:

1. **Hero / event header** — name, tagline, date, start time, location, hero visual.
2. **Timeline** — collapsible **mini-Gantt "Обзор дня"** overview + a filterable **vertical agenda**.
3. **Event cards** — compact in the agenda; full detail on tap.
4. **Partners** — one flat section (grid → swipe on mobile).
5. **Footer** — "Powered by BesedaTech" + CTA.
6. **"Сейчас / Далее" banner** (day-of) — surfaces the current/next activity by the clock.

---

## 5. Detailed feature requirements

### 5.1 Hero / event header
- Displays: event name **«Большой русскоязычный пикник»**, one-line tagline, **date**, **start time**, **location name + address**, and a link/tap to open the venue in a maps app.
- Prominent primary action: **"Добавить весь день в календарь"** (whole-event `.ics`).
- Hero visual: a warm picnic-themed image or illustrated banner (asset TBD).
- Location row deep-links to Google/Apple Maps via a `geo:` / maps URL.

### 5.2 Timeline

**(a) "Обзор дня" — mini-Gantt overview (collapsible, sticky-optional)**
- A compact horizontal band spanning the day (≈09:00–19:00) with a light hour axis.
- Four thin group lanes (**Общее / IT / Детская программа / Игры**), each showing colored blocks for its events — this is where parallelism is visible at a glance without the pain of a full mobile Gantt. On the narrowest screens the lanes stay compact; if four feels tight, they can collapse into a single density bar with per-group color segments.
- Tapping a block **scrolls the agenda** to that event/time.
- Day-of: a vertical **"сейчас" marker** tracks the current time.
- Collapsed by default on small screens behind a **"Обзор дня ▾"** toggle; expands inline. Respects `prefers-reduced-motion`.

**(b) Vertical agenda (primary browse)**
- Chronological, top-to-bottom, with a **time rail** on the left and event cards on the right.
- **Sticky filter chips** at the top:
  - Group: `Все · Общее · IT · Детская программа · Игры`
  - (Optional) Audience: `Все · Дети · Подростки · Взрослые`
- **Parallel events** stack under the same time slot with a subtle **"идёт параллельно"** hint / count.
- **Start-only events** (e.g. *Аня Кулешова*, *Лотерея*) render as point markers with a single time, visually distinct from ranged bars.
- Tapping any agenda row opens the **full event card** (expand-in-place or route `/#/event/:id`).

### 5.3 Event cards (full detail)
Each event shows:
- Title (kept in original wording, e.g. *«мафия для подростков»*), time range (or single start time), **group** (color) and **audience tags**.
- Full description / details (long text from JSON).
- **Area / location** within the venue (if provided).
- **Organizers / hosts** — the people or communities running *this* event (e.g. *Катя* hosting *«мафия для подростков»*). Shown as a name, an optional role, a type indicator (person / community / org), and an outbound link **only if one exists**. Organizers are lightweight and inline to the event — they do **not** need a logo or site and do **not** appear in the Partners section.
- **Related partners** *(optional)* — shown only when this event is tied to an actual featured partner/sponsor (via `partnerIds`). Renders that partner's logo, linking into the Partners section / partner site. Most events won't have any.
- **"Добавить в календарь"** action (see 5.4).
- **Signup / capacity** — *rendered only if present in data* (see §7 & Open Questions). If absent, the event is treated as drop-in and no button shows.

### 5.4 Calendar integration
- **Per-event**: an "Добавить в календарь" control offering:
  - **`.ics` download** (works with Apple Calendar, Outlook, most clients).
  - **Google Calendar** template link (opens prefilled event).
- **Whole-event**: hero action generates a **combined `.ics`** with all sessions (or a curated selection — see below).
- **(Nice-to-have) "Мой план"**: let users tick events they want and export only those as one `.ics`. Selection stored in-memory / `URL` state only (no accounts). *Flagged as stretch.*
- All `.ics` generation is **client-side** (no server). Point events without an end time need a default duration for the calendar entry — **default 30 min** unless specified (Open Question).

### 5.5 Partners section (flat)
- **Source of truth:** this section renders **only** entries from `partners.json` — i.e. featured partners/sponsors with a logo, site, and brand presence. Event **organizers/hosts** (like Katya) live inline on their event card and are **never** pulled in here. An organizer can *also* be a partner, but only if they're explicitly listed in `partners.json`.
- **One flat section** — partners and sponsors shown together, no tiers.
- Layout: responsive **logo grid** on wider screens that becomes a **horizontally swipeable row** on phones; each tile is tappable.
- Tap → detail (modal or expand): name, short description, category, outbound link, and related events.
- **No autoplay carousel** (accessibility + battery). If a moving element is desired, use a manually-swiped, non-auto row with visible controls.
- Optional `featured` flag can enlarge/pin a partner.

### 5.6 Footer / BesedaTech CTA
- **"Powered by BesedaTech"** wordmark/logo.
- Soft CTA, e.g.: *«Хотите такую же страницу для своего мероприятия? Сделаем вместе → напишите нам»*, linking to a BesedaTech contact/landing URL (TBD).
- Standard footer bits: event organizer credit, social links, year.

### 5.7 "Сейчас / Далее" banner (day-of)
- A dismissible banner near the top that, based on the device clock, shows **what's on now** and **what's next**, each linking to its card.
- Only appears on the event date; otherwise hidden.
- Pure client-side; no backend.

---

## 6. Visual design direction — "Warm community picnic"

**Mood:** friendly, warm, outdoorsy, community-run. Not corporate, not childish. Think checkered-blanket warmth with clean modern structure.

**Palette (proposal — adjustable):**
- Background / "paper": warm cream `#FBF7EF`
- Ink / text: `#2E2A26`
- Primary accent (warm): terracotta `#D2683F`
- Secondary: sage green `#7C8B5A`
- **Group colors carried over from the schedule** (for consistency with the spreadsheet/timeline work):
  - Общее — warm gray `#888780`
  - IT — blue `#2A78D6`
  - Детская программа — coral `#E0642A`
  - Игры — violet `#6B62C0`

**Typography:** a friendly, rounded sans with **full Cyrillic support** (critical — the UI is Russian). Candidates: *Onest, Manrope, Nunito, Golos Text*. Verify Cyrillic glyph coverage and licensing before locking.

**Texture / motifs:** subtle picnic cues used sparingly (soft gingham/blanket texture on section dividers, rounded "sticker"-style tags, generous rounding on cards). Keep it light so it stays legible on small screens.

**Components:** large rounded cards, chip-style tags, big tap targets, soft shadows. Motion is gentle and disabled under `prefers-reduced-motion`.

---

## 7. Data model (JSON)

**Principle: everything editable lives in JSON — no content, groups, colors, or UI copy hardcoded in the app.** Four files, all editable by non-developers. Shapes below are indicative.

### `groups.json` (group definitions — the taxonomy + colors)
```json
[
  { "id": "obshee",   "label": "Общее",             "color": "#888780", "order": 1 },
  { "id": "it",       "label": "IT",                "color": "#2A78D6", "order": 2 },
  { "id": "kids",     "label": "Детская программа", "color": "#E0642A", "order": 3 },
  { "id": "games",    "label": "Игры",              "color": "#6B62C0", "order": 4 }
]
```
This makes the group set fully data-driven: adding, renaming, recoloring, or reordering a group is a JSON edit, not a code change. Events reference a group by its `id` (or `label`); the app reads colors and filter chips from here rather than hardcoding them. (Given the group structure has already changed more than once, this file earns its keep.)

### `event.json` (the grand event)
```json
{
  "name": "Большой русскоязычный пикник",
  "tagline": "Книги, игры, дети и AI — весь день на свежем воздухе",
  "date": "2026-08-15",
  "startTime": "09:00",
  "location": {
    "name": "…",
    "address": "…",
    "mapUrl": "https://maps.google.com/…"
  },
  "heroImage": "/assets/hero.jpg",
  "description": "…",
  "besedatech": { "ctaText": "…", "ctaUrl": "https://…" }
}
```

### `events.json` (sub-events)
```json
[
  {
    "id": "beseda-ai",
    "title": "Beseda AI Meetup",
    "group": "IT",
    "audience": ["Взрослые"],
    "start": "13:00",
    "end": "18:00",
    "area": "",
    "shortDescription": "Митап / секция AI-сообщества",
    "description": "…",
    "organizers": [
      { "name": "Beseda", "type": "community", "role": "Хост секции", "url": "https://…" }
    ],
    "partnerIds": ["beseda"],
    "tags": ["AI"],
    "signup": { "mode": "none", "url": null, "capacity": null }
  }
]
```
Field notes:
- `end` may be `null` for start-only events (rendered as point markers; calendar default duration applies).
- `group` references an entry in `groups.json` (by `id` or `label`); the group's color, chip label, and ordering come from that file — nothing about groups is hardcoded.
- `audience` is an array of tag strings for filter chips.
- **`organizers`** — the people/communities running the event, shown inline on the card. Fields: `name` (required), `type` ∈ `{ "person", "community", "org" }`, optional `role`, optional `url`. **Lightweight and self-contained** — a host needs nothing more than a name. Example for a host with no web presence: `{ "name": "Катя", "type": "person", "role": "Ведущая" }` (no `url`, no logo).
- **`partnerIds`** — links this event to featured partners/sponsors defined in `partners.json`. This is the **only** field that surfaces an entity in the Partners section. Organizers are *not* auto-promoted to partners; keep it empty (or omit) when an event is just run by a host like Katya. Usually empty.
- **`signup.mode`** ∈ `{ "none", "external", "internal" }`. v1 default `"none"` (drop-in). `"external"` shows a button to `url`; `"internal"` reserved for future. This keeps the signup decision deferrable without a schema change later.

### `partners.json`
```json
[
  {
    "id": "beseda",
    "name": "Beseda",
    "logo": "/assets/partners/beseda.svg",
    "category": "AI",
    "url": "https://…",
    "description": "…",
    "relatedEventIds": ["beseda-ai"],
    "featured": false
  }
]
```

The spreadsheet already produced maps directly onto these shapes — the `Расписание` sheet → `events.json`, the `Партнёры` sheet → `partners.json`, and the group legend → `groups.json`. *(Note: with the organizer/partner split, some rows currently seeded on the spreadsheet's `Партнёры` sheet — e.g. the games/D&D masters, the kids animation team — are really per-event **organizers**, not featured partners. When exporting, route those onto their events' `organizers` and keep `partners.json` for entities that genuinely have a logo/site.)*

**UI copy:** user-facing labels that aren't event content (section titles, "Обзор дня", "Добавить в календарь", "Сейчас / Далее", footer text) are also externalized into a small **`strings.json`** so nothing user-visible is buried in code. This keeps the whole surface swappable and makes a future language toggle a drop-in. *(Optional for a one-off, but consistent with the "all data in JSON" principle.)*

---

## 8. Mobile-first / responsive specs
- Design at 360–390px width first; scale up to tablet/desktop as enhancement.
- Tap targets ≥ 44×44px; single-column by default.
- Sticky filter chips and (optionally) the "Обзор дня" toggle.
- Fast first paint; lazy-load partner logos and hero image; inline critical CSS.
- Works offline-ish: content is static JSON; consider a simple service worker for repeat visits (stretch).

---

## 9. Tech & architecture
- **Static SPA.** Recommended: **React + Vite + TypeScript** (fast, well-supported), or plain vanilla + a tiny router if we want zero framework. Styling via Tailwind or CSS modules.
- **No backend.** Content fetched from local JSON at build/runtime.
- **Client-side `.ics`** generation and Google Calendar links.
- **Hosting:** any static host — Netlify / Vercel / GitHub Pages / Cloudflare Pages.
- **Routing:** hash or path routing for `/#/event/:id` deep links (shareable).
- **Analytics (light, privacy-friendly):** e.g. Plausible or GA4 — track page views, calendar-add clicks, partner clicks, CTA clicks.

---

## 10. Accessibility & i18n
- **Russian-first UI.** All chrome/labels in Russian. (English toggle is a possible future item, not v1.)
- Ensure the chosen font fully covers Cyrillic.
- Semantic HTML, logical heading order, focus states, keyboard navigability.
- Color contrast ≥ WCAG AA; don't rely on color alone (pair group color with a label/tag).
- Honor `prefers-reduced-motion` (disables mini-Gantt animation, any partner-row motion).

---

## 11. Success metrics
Since this is a one-off page, keep it simple:
- Unique visitors / sessions (esp. on event day).
- **Calendar adds** (per-event + whole-day) — primary engagement signal.
- Partner outbound clicks.
- BesedaTech CTA clicks (the showcase goal).
- Bounce / scroll depth as a UX sanity check.

---

## 12. Open questions / decisions needed
1. **Signups & capacity** — *undecided.* Data model supports it (`signup.mode`), rendered only when present. Decide before launch whether any of the D&D tables / ЧГК / masterclass need external signup links or capacity display.
2. **Content assets** — do we have organizer/community **links**, partner **logos**, and full event **descriptions**? If not, PRD assumes placeholders and a content-gathering pass.
3. **Venue** — exact location name, address, and map link.
4. **Hero imagery** — photo vs. custom illustration; who provides it.
5. **Point-event calendar duration** — default 30 min for start-only events (Аня, Лотерея), or specify real end times?
6. **BesedaTech CTA** — final copy and destination URL.
7. **Partners vs sponsors wording** — one flat section confirmed; confirm the section title (e.g. «Партнёры» vs «Партнёры и друзья пикника»).
8. **"Мой план" selective export** — build in v1 or defer?
9. **Language** — Russian-only confirmed for v1; note if an EN toggle is wanted later.

---

## 13. Out of scope / future
- Multi-event / reusable template (the JSON structure is already friendly to it).
- CMS / admin editing.
- Accounts, notifications, ticketing/payments.
- Live updates / push.

---

## 14. Suggested build phases
1. **Content & data** — finalize `groups.json`, `event.json`, `events.json`, `partners.json` (and `strings.json`) from the spreadsheet; gather links/logos/images.
2. **Skeleton** — project setup, routing, design tokens, layout shell.
3. **Timeline** — vertical agenda + filters, then the "Обзор дня" mini-Gantt.
4. **Cards & calendar** — full event detail + `.ics`/Google Calendar.
5. **Partners & footer** — flat partner section + BesedaTech CTA.
6. **Day-of & polish** — "Сейчас / Далее" banner, a11y pass, QA on real devices, analytics.

---

## Appendix A — Content inventory (from the schedule)

Groups: **Общее**, **IT**, **Детская программа**, **Игры**.

| Group | Event | Start | End | Audience |
|---|---|---|---|---|
| Общее | Книжная ярмарка | 10:00 | — | Все |
| IT | Beseda AI Meetup | 13:00 | 18:00 | Взрослые |
| Общее | Аня Кулешова | 14:00 | — | Все |
| Общее | киноклуб | 16:00 | 18:00 | Все |
| Общее | Лотерея | 17:00 | — | Все |
| Детская программа | анимация для детей 4-8 лет | 11:00 | 13:00 | Дети 4–8 |
| Детская программа | шоу мыльных пузырей и face patting | 13:00 | 13:30 | Дети 4–8 |
| Детская программа | мастер класс музыкальный для детей 4-8 лет | 14:00 | 15:00 | Дети 4–8 |
| Игры | D&D для взрослых | 10:30 | 12:30 | Взрослые |
| Игры | мафия для подростков | 13:00 | 15:00 | Подростки |
| Игры | D&D для детей (8-12 лет) | 13:00 | 15:00 | Дети 8–12 |
| Игры | Мафия/настолки для взрослых | 14:00 | 19:00 | Взрослые |
| Игры | ЧГК | 16:00 | 18:00 | Подростки / взрослые |
| Игры | D&D для (12-18 лет) | 16:00 | 18:00 | Подростки 12–18 |

*Note: internal setup at 09:00 (3 tables, chairs, flags, signage, lottery-ticket box — one ticket per guest, stub in the box) is org-only and not shown on the public timeline.*

## Appendix B — Partners (seed)
Book fair vendor · Beseda (AI) · Аня Кулешова (guest/performer) · Kids animation team · Games / D&D masters · Film club. Contacts, logos, and links to be supplied.
