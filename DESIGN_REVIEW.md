# Design & UX/UI Review — «Большой русскоязычный пикник»

**Reviewer:** Claude Code · **Date:** 2026-07-06
**Under review:** the event microsite app (`src/`, `public/data/`) built on the «Пикник» Design System (`tokens/`, `components/core/`).
**Method:** static reading of every component, token file and data file; a production build (`npm run build`, clean); the running app screenshotted at 390 px mobile and 1280 px desktop across hero / overview / agenda / event sheet / partner sheet / partners / footer; and WCAG contrast ratios computed for the real token pairings (table in Appendix A).

> **Scope note.** This review weights the user-facing microsite, since that is the live product. The design system is assessed as the foundation that underpins it. It is an assessment deliverable with prioritized, actionable fixes — not a set of applied changes.

---

## 1. Executive summary

This is a genuinely well-crafted microsite. The "cream paper + printed sticker" concept is executed with real discipline: one token layer, no stray hex, a coherent Spectral/Onest type pairing with full Cyrillic, and a signature sticker-tag motif that carries category meaning through outline **and** dot **and** label (never colour alone). The information architecture is sound, the accessibility fundamentals are above average for an event page (landmarks, focus-visible, focus-trapped modals, `inert` background, reduced-motion, AA-passing text — verified numerically), and every pixel of content is JSON-driven as the PRD demanded.

The gaps are almost all **refinement and content-readiness**, not structural defects. The highest-value work is: (1) taming the "идёт параллельно" signal, which is currently noise on nearly every card; (2) the mini-Gantt's sub-44 px tap targets and heavy truncation; (3) a desktop presentation that undersells the site given that "BesedaTech showcase" is an explicit goal; and (4) the partner section, which currently renders 14 near-identical grey boxes because no logos exist yet and the fallback isn't on-brand.

**Overall: strong B+ / A−.** Ship-ready as a mobile page after the P0/P1 items; a few of those are quick wins.

| Area | Verdict |
|---|---|
| Brand & visual craft | Excellent |
| Typography | Excellent |
| Colour & contrast | Excellent (AA verified) |
| Accessibility (structure) | Very good |
| Accessibility (target size / mini-Gantt) | Needs work |
| Mobile layout | Very good |
| Desktop layout | Underdeveloped |
| Interaction micro-states | Underdeveloped (no hover/press) |
| Content readiness | Partial (logos, venue, dead copy) |
| PRD conformance | High, with a few defensible deviations |

---

## 2. What works well (keep it)

- **Cohesive, distinctive aesthetic.** The warm cream bands, hard `0 2px 0` offset shadows and 1.5 px sticker outlines read as one intentional system, not a template. This is the site's biggest asset.
- **Type pairing.** Spectral (display) over Onest (UI), tight display tracking, 1.5 body leading. The hero sets beautifully in Cyrillic; hierarchy is legible top to bottom.
- **Colour is never the only signal.** Category is always outline + filled dot + text label (`CategoryTag.tsx`), and the parallel hint pairs its sage dot with a text label. This satisfies WCAG 1.4.1 by construction — a common failure this codebase avoids.
- **Token hygiene.** No hardcoded hex anywhere in `src/` (only the deliberate category values, which live in data). Semantic aliases (`--surface-*`, `--text-*`, `--accent*`) are used, not raw ramps.
- **Accessibility scaffolding.** `<header>/<main>/<footer>` landmarks; `:focus-visible` outline; the bottom sheet is a real `role="dialog"` with focus trap, scroll lock, Esc/backdrop dismissal, and it marks `#page-content` `inert` + `aria-hidden` while open. Reduced-motion is honoured globally *and* per-feature.
- **Correct day-of behaviour.** The "Сейчас/Далее" banner and the Gantt "сейчас" marker are correctly hidden off-date (they only arm on the event day) — verified: on today's date both are absent, as intended.
- **Graceful placeholders.** The diagonal-stripe hero frame with a mono caption chip is a tasteful stand-in for the missing hero photo.

---

## 3. Findings by area

Severity scale: **P0** = fix before launch · **P1** = high-value polish · **P2** = nice-to-have / nit.

### 3.1 Timeline — "Идёт параллельно" is noise, not signal — **P1**

Nearly every one of the 18 agenda cards carries an "идёт параллельно · N" line, and the counts are inflated by the two all-day events: *Книжная ярмарка* (10:00–18:00) shows **· 17** and *Beseda AI Meetup* (13:00–18:00) shows **· 14** (visible in the agenda screenshots). `parallelCount` (`src/lib/time.ts:47`) counts every event overlapping *anywhere* in the day, so a long block "runs parallel to" almost the entire programme. Telling a visitor an event is parallel to 17 others is functionally telling them nothing.

- **Impact:** the hint appears on ~all cards, so it stops being a differentiator and becomes visual clutter — exactly the opposite of the PRD's intent ("parallelism visible at a glance").
- **Recommendation:** either (a) cap and reframe the count to *concurrent-at-a-given-moment* / peak overlap rather than any-overlap, (b) suppress the hint for all-day/long anchor events, or (c) drop the numeric count and show the hint only when 2–3 genuinely competing sessions share a start slot. The mini-Gantt already carries the "everything overlaps" story better than a per-row integer does.

### 3.2 Timeline — mini-Gantt tap targets & truncation — **P1**

`DayOverview.tsx` sets `BLOCK_H = 26`, point-event circles at 26 px, and `MIN_W = 28`. Every interactive block in the overview is **below the 44 px touch target** (WCAG 2.5.5; even the 24 px AA floor of 2.5.8 is only barely cleared). In the rendered overview the short blocks truncate to a single stray letter ("l", "M", "А.", "О.") and most others to "D&D д…", "Мафия для п…", "«Что? …" — the labels stop carrying information.

- **Impact:** the overview is hard to tap accurately one-handed, and past the colour + position it reads more as a density smear than a schedule. (Screen-reader users are fine — each block has a full `aria-label`.)
- **Mitigation already present:** every block also exists as a full-size agenda row, so this is a secondary surface — which is why it's P1, not P0.
- **Recommendation:** raise block/lane height toward 32–36 px and pad the point circles' hit area to ≥44 px (a transparent tap layer larger than the visual dot). Consider hiding labels entirely below a width threshold and relying on colour + the tap-through, rather than showing a one-character stub.

### 3.3 Timeline — overview lanes deviate from the PRD, and tapping opens detail — **P2 (deviation, defensible)**

PRD §5.2(a) specified **four named group lanes** (Общее / IT / Детская / Игры). The implementation packs blocks into anonymous **concurrency lanes** (peak-overlap packing, `packLanes`). This is a reasonable space trade on a 390 px screen, but the rows are unlabelled, so a viewer can't map a row to a meaning. Separately, PRD §5.2(a) said a block tap should **scroll the agenda to that time**; the code opens the event **detail sheet** instead (`onOpen(seg.id)` → `/#/event/:id`).

- **Recommendation:** both choices are defensible — just make them deliberate. If you keep concurrency packing, the deviation is fine; if group-clarity matters, a compact single "density bar" per group (the PRD's own fallback) may communicate parallelism better than anonymous rows. No action required beyond a decision.

### 3.4 Agenda — the time is shown twice per card — **P2**

Each row's left rail stacks the start time large and the end time small underneath (`Agenda.tsx:129–152`), while the meta line to the right *also* prints `10:00 – 12:00 · 2 ч`. So start and end each appear twice, and the bare stacked "10:00 / 12:00" with no separator can be misread as two unrelated times rather than a range.

- **Recommendation:** let the rail carry one strong anchor (start time) plus the duration, and let the meta line carry the full range — or vice-versa. Remove the duplication so the eye isn't asked to reconcile the same two numbers in two places.

### 3.5 Partners — degrades to 14 grey boxes, and off-brand fallback — **P1**

All 14 partners currently have `logo: null`, so the entire section renders identical grey slots. Worse, the empty slot shows the **category** text (`Partners.tsx:92`, `LOGO_PLACEHOLDER`) and the card *also* prints the category on the line below the name (`CARD_CATEGORY`), so "Игры" appears twice per card while the actual partner name is the smallest thing on it. The partner **sheet** repeats the same doubling.

This also contradicts the design brief's own guidance: `readme.md` Iconography says the missing-logo fallback should **render the brand name as type** (e.g. "a terracotta 'Beseda' tile"), not a grey category chip.

- **Recommendation:** make the logo-less fallback a **type wordmark of the partner name** (Spectral or a terracotta tile, per the brief), and drop the duplicated category from the slot. This turns the weakest-looking section into an on-brand one *without waiting for logo assets*, and is a quick win.

### 3.6 Desktop — a phone column on an empty dark field undersells the showcase — **P1**

On wide screens `#root` is a 460 px column centred on the dark-brown body background (`src/styles/global.css`), with **square top corners** and only a faint screen shadow. The surround is the same brown as the footer, so the footer dissolves into the page edge and the whole thing reads like an unstyled letterbox. The design system defines `--radius-screen: 30px` for a device frame — it isn't applied here.

- **Impact:** "Act as a BesedaTech showcase … a polished reference prospects point at" is an explicit PRD goal (§2). Desktop is where a prospect on a laptop lands, and it's the least finished view.
- **Recommendation:** give the desktop column an intentional frame — apply `--radius-screen`, lift it on `--shadow-screen`, and choose a surround that isn't identical to the footer (a lighter warm field, or the device-frame treatment the tokens already anticipate). Even a small amount of framing turns "unstyled column" into "deliberate phone mock."

### 3.7 Interaction — no hover, press, or transition states anywhere — **P1 (desktop-weighted)**

Every style in the app is an inline `style={{}}` object, so there are **no `:hover` or `:active` states** on any card, chip, button or link (grep confirms zero across `src/`, `styles.css`, `tokens/`). The only animation in the entire app is the sheet slide (`Sheet.tsx`). The design brief promises "primary button darkens to `--terracotta-ink`" and "transitions ~0.15 s" — the active filter-chip state is implemented, but hover/press feedback and those transitions are absent.

- **Impact:** on desktop, nothing responds to the cursor — buttons and cards feel inert, which reads as "prototype." On touch there's no press feedback either.
- **Recommendation:** introduce a thin CSS class layer (or `data-` attributes) for interactive elements so `:hover`/`:active`/`:focus-visible` can darken the accent, deepen the sticker shadow, or nudge the offset. This is the single change that would most raise the perceived polish, and it doesn't disturb the token model.

### 3.8 Modal — no scrim and no drag handle — **P2**

The design bans transparency, so the bottom sheet has **no dimmed backdrop**: it slides over a transparent strip that shows live page content (visible at the top of the event/partner sheet screenshots), with only a floating ✕. Figure-ground separation rests entirely on the soft top-edge shadow, and the panel is the same cream as the hero. There's also no **grabber handle**, and no swipe-to-dismiss — conventions users expect from a bottom sheet.

- **Recommendation:** within the no-transparency constraint, add a small centred drag-handle affordance at the sheet's top and consider a subtle solid top border/tint change so the sheet edge is unmistakable. (Swipe-to-dismiss is optional; Esc/backdrop/✕ already cover dismissal.)

### 3.9 Filters — two identical "Все" with no dimension labels — **P2**

The filter block stacks a group row and an audience row, each beginning with an identical "Все" pill, and neither row has a visible caption (the `aria-label`s "Фильтр по программе / по аудитории" serve SR users only). A sighted user sees two "Все" and has to infer which axis is which; the group row is also clipped at the right edge (Игры half-visible).

- **Recommendation:** add a tiny letter-spaced caption before each row ("Программа" / "Аудитория"), or merge into one row if space allows. Consider a right-edge fade to signal the horizontal overflow.

### 3.10 Content & copy — dead strings incl. the missing scroll cue — **P2**

Several strings in `strings.json` are defined but never rendered (grep-confirmed): `hero.scrollHint` ("прокрути весь день ↓"), `timeline.overviewToggleShow` / `overviewToggleHide`, and `timeline.parallelCount`. The scroll cue in particular is a deliberate affordance from the design brief that never made it to screen — the hero ends at the CTA with no "there's a whole day below" hint.

- **Recommendation:** either wire up `scrollHint` under the hero (it's a nice, on-brand nudge) or delete the dead keys so the JSON reflects reality. Reconcile the toggle/count strings with what the components actually build.

### 3.11 Content readiness (not design defects, but launch-blocking) — **P0 for launch**

- **Venue is "Место уточняется"** with an empty `mapUrl`, so the hero shows no address and no map link, and the whole-day `.ics` a visitor downloads has no location. (PRD Open Question §3.)
- **No hero image** and **no partner logos** (all `null`). Placeholders are graceful, but this is the content-gathering pass the PRD flagged (§12.2, §12.4).
- These are data edits, not code — the architecture handles them the moment content arrives.

### 3.12 Accessibility — smaller items — **P2**

- **No skip link.** With a sticky filter bar above a long 18-row agenda, a "skip to programme" link would help keyboard users. Minor for a single-column page, but cheap.
- **"Обзор дня" is a disclosure button, not a heading**, so it doesn't appear in the heading outline between the hero (h1) and "Программа дня" (h2). Defensible, but a visually-hidden heading would round out the outline.
- **Heading order is otherwise clean:** h1 hero → h2 section titles / sheet titles → h3 card titles / sheet subheads.

---

## 4. Prioritized recommendations

| # | Item | Severity | Effort | Section |
|---|---|---|---|---|
| 1 | Fix venue / map / hero image / partner logos (content) | P0 (launch) | Data | 3.11 |
| 2 | Tame "идёт параллельно" — cap/reframe or drop the count | P1 | S | 3.1 |
| 3 | On-brand partner fallback (name-as-type), drop duplicate category | P1 | S | 3.5 |
| 4 | Add hover/press/focus micro-states + the promised transitions | P1 | M | 3.7 |
| 5 | Give the desktop column an intentional frame (`--radius-screen`, distinct surround) | P1 | S–M | 3.6 |
| 6 | Enlarge mini-Gantt tap targets to ≥44 px; rethink 1-char truncation | P1 | M | 3.2 |
| 7 | De-duplicate the time display in agenda rows | P2 | S | 3.4 |
| 8 | Wire up (or remove) `scrollHint` and other dead strings | P2 | S | 3.10 |
| 9 | Add sheet drag-handle affordance | P2 | S | 3.8 |
| 10 | Label the two filter rows / signal horizontal overflow | P2 | S | 3.9 |
| 11 | Skip link + visually-hidden "Обзор дня" heading | P2 | S | 3.12 |
| 12 | Decide the Gantt lane model & block-tap behaviour vs PRD | P2 | — | 3.3 |

**Quick wins (high value / low effort):** #2, #3, #7, #8.

---

## Appendix A — Contrast verification (WCAG 2.1)

Computed from the actual token values against the real surfaces they sit on. Normal-text threshold 4.5:1. **Every text pairing used in the app passes AA.** The two sub-threshold ramp colours (`--brown-400`, `--brown-500`) are marked "decorative only" in `tokens/colors.css` and are confirmed **not used for any text in `src/`**.

| Pairing | Ratio | AA (normal) |
|---|---:|:---:|
| body `#6b5d47` on page `#f6efe0` | 5.59 | ✅ |
| body `#6b5d47` on panel `#f1e7d2` | 5.21 | ✅ |
| body `#6b5d47` on card `#fffdf7` | 6.29 | ✅ |
| muted/mono `#756545` on page | 4.95 | ✅ |
| muted/mono `#756545` on panel | 4.62 | ✅ |
| muted/mono `#756545` on card | 5.57 | ✅ |
| accent text `#9c4f34` on page | 5.12 | ✅ |
| accent text `#9c4f34` on panel | 4.77 | ✅ |
| white on button `#9c4f34` | 5.86 | ✅ |
| strong `#3a2c1c` on card | 13.26 | ✅ |
| footer body `#e9dcc4` on `#3a2c1c` | 9.95 | ✅ |
| footer muted `#c7b596` on `#3a2c1c` | 6.73 | ✅ |
| active-chip text `#e9dcc4` on `#3a2c1c` | 9.95 | ✅ |
| *(decorative)* faint label `#9c8d6f` on page | 2.84 | ⚠️ not used as text |
| *(decorative)* placeholder `#a2926f` on stripe | 2.33 | ⚠️ not used as text |

## Appendix B — Surfaces reviewed (screenshots)

Hero · filter chips · collapsed & expanded "Обзор дня" mini-Gantt · full 18-row agenda · event detail sheet (`/#/event/…`) · partner detail sheet (`/#/partner/…`) · partners row · footer · 1280 px desktop. Build was clean (`tsc -b && vite build`, 142 modules, no warnings).
