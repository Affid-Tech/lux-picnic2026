# «Пикник» — Design System

A warm, tactile design system for **«Большой русскоязычный пикник»** — a full-day,
Russian-language community picnic event, powered by **BesedaTech**. The aesthetic is "cream paper + printed
stickers": warm neutrals, a terracotta accent with a sage companion, a Spectral
serif for display, Onest for UI, and four fixed program-category colours.

This system was derived from the approved **concept 1a** ("warm tactile picnic")
of the homepage explorations. It is intended as the visual foundation for
continued build-out (e.g. in Claude Code).

> **Source of truth:** `Пикник - концепты главной.dc.html` (concept `1a`). There is
> no external codebase or Figma — this system formalises that concept.

---

## Content fundamentals

- **Language:** Russian throughout. UI copy, categories, and labels are all in Cyrillic.
- **Voice:** warm, inviting, informal-but-not-childish. Speaks to a family audience
  ("Приходи всей семьёй", "До встречи на поляне"). Uses **ты**-adjacent friendliness
  without being pushy.
- **Casing:** Sentence case for body and titles. UPPERCASE only for letter-spaced labels.
- **Category names (fixed):** Общее · IT · Детская программа (short: «Детская») · Игры.
- **Punctuation:** middot `·` separates meta ("Сцена А · 4 спикера", "6 июля · вход свободный").
  En-dash for ranges ("11:00 – 19:00").
- **Numbers:** 24-hour time ("13:00"), durations as "1 ч" / "1.5 ч".
- **Emoji:** used *sparingly* and only in warm closing moments (a single 🌿 in the
  footer). Never in agenda rows, buttons, or category tags.
- **Example strings:** "Зарегистрироваться" → after tap "Вы идёте! ✓"; "прокрутите
  весь день ↑"; "фото · главная поляна" (placeholder caption).

## Visual foundations

- **Mood:** printed picnic zine on cream paper. Tactile, handmade, friendly, uncluttered.
- **Colour:** warm cream surfaces (`--cream-50…500`), warm brown ink (`--brown-900…300`),
  a **terracotta** primary accent (`#c26a4a`) and a **sage** companion (`#7d8b6a`).
  Saturated colour appears almost exclusively through the four category hues.
- **Category colours are fixed and semantic** — Общее `#888780`, IT `#2A78D6`,
  Детская `#E0642A`, Игры `#6B62C0`. Never reassign them; always surface them through
  `<CategoryTag>` / `<DayOverviewBar>`.
- **Type:** Spectral (serif) for hero + section titles; Onest (sans) for everything
  else; a mono stack for placeholder captions and hour ticks. Display is set tight
  (`-0.01em`), body at 1.5 line-height.
- **Backgrounds:** flat warm fills. Two surface tones alternate down the page
  (`--surface-page` / `--surface-panel`); the footer flips to the dark brown
  (`--surface-inverse`). No gradients.
- **Imagery:** real photos go in rounded (`--radius-xl`) frames. Until supplied, use
  the **diagonal-stripe placeholder** (`repeating-linear-gradient` of cream-300/400)
  with a mono caption chip — never a hand-drawn illustration.
- **Cards:** cream surface, 1px cream-400 border, **hard 2px offset shadow with no blur**
  (`--shadow-card`) — the "sticker peeled onto paper" feel. Radius `--radius-lg` (16px).
- **Sticker tags:** white fill, 1.5px colour outline, filled colour dot, and a hard
  `0 2px 0` drop-shadow. Pill radius. This is the signature motif.
- **Borders / rules:** hairline cream borders; **dashed** cream rules inside event cards
  (the time / body divider).
- **Shadows:** only two kinds — the hard offset card/sticker shadow, and a soft ambient
  `--shadow-screen` for the phone frame itself. No mid-blur drop shadows elsewhere.
- **Corner radii:** sticker/chips = pill; cards = 16; media = 18; buttons = 12; the
  device frame = 30.
- **Layout:** mobile-first, 390px, 22px gutter. Vertical rhythm via alternating surface
  bands. Content flows top→bottom: hero → day-overview → filters+agenda → partners → footer.
- **Interaction / states:** primary button darkens to `--terracotta-ink` conceptually;
  active filter chip flips to dark brown fill. Disabled = reduced opacity. Transitions
  are short (~0.15s) and understated — no bounces.
- **Transparency / blur:** none. Everything is opaque flat paper.

## Iconography

- **No custom icon set and no logo were provided.** Where a brand mark would go, the
  name is rendered in plain type ("BesedaTech" in the footer;
  a terracotta "Beseda" tile in the partners grid).
- **Do not invent a logo.** If/when a real mark is supplied, drop it into `assets/` and
  swap the type treatments.
- **Glyphs in use:** a small set of Unicode characters as lightweight icons — `↑` / `↓`
  (scroll hints), `✓` (confirmed state), `·` (meta separator), a single `🌿` in the
  footer. No icon font, no SVG icon library.
- If an icon system becomes necessary, prefer a light-stroke CDN set (e.g. Lucide) and
  document the choice here — flag it as an addition.

---

## Index / manifest

- **`styles.css`** — global entry point (link this). `@import`s the token files:
  - `tokens/fonts.css` — Onest + Spectral via Google Fonts CDN
  - `tokens/colors.css` — palette + semantic aliases
  - `tokens/typography.css` — families, scale, weights
  - `tokens/spacing.css` — spacing, radii, shadows
- **`components/core/`** — reusable primitives:
  - `Button` — primary / secondary action button
  - `CategoryTag` — sticker category pill (exports `CATEGORIES` map)
  - `EventCard` — agenda row (starting point)
  - `DayOverviewBar` — compact full-day segmented bar
  - `PartnerTile` — flat partners-grid cell
  - `SectionHeading` — Spectral section title + meta
- **`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand).
- **`ui_kits/event-homepage/`** — interactive recreation of the mobile homepage.
- **`SKILL.md`** — Agent-Skill wrapper for use in Claude Code.

## Caveats / substitutions

- Fonts load from the **Google Fonts CDN**. For offline/production, self-host Onest +
  Spectral and replace the `@import` in `tokens/fonts.css` with `@font-face` rules.
- No logo or icon assets exist yet — see Iconography.
