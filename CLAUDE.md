# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The **«Пикник» Design System** — the visual foundation for *«Большой русскоязычный
пикник»*, a Russian-language community event by BesedaTech. It is **not an app**: there
is no server, no bundler, no `package.json`, no test suite. It is a set of design tokens
(CSS custom properties), React component primitives, and static HTML specimen pages.

The source of truth for the whole aesthetic is `readme.md` (read it first — it is the
design brief) and the origin concept `Пикник - концепты главной.dc.html`. The repo is also
packaged as a Claude Code skill via `SKILL.md` (`piknik-design`).

## How to run / preview

There is no build step. Preview any `*.html` file by opening it directly in a browser:

- `ui_kits/event-homepage/index.html` — the full interactive mobile homepage.
- `components/core/core.card.html` — a gallery of every core component.
- `guidelines/*.html` — one specimen card per foundation (colors, type, spacing, brand).

These HTML pages load React + ReactDOM + Babel from the **unpkg CDN** and pull components
from `_ds_bundle.js` at runtime, so a network connection is needed to view them. They link
`styles.css` for tokens via relative paths, so serving from the repo root (`python3 -m
http.server`) keeps the `../../styles.css` links working.

## Architecture and the sync invariants

The two things most likely to break are the duplicated component definitions and the
generated runtime. Understand these before editing:

### 1. Components exist in four parallel files — keep them in sync

For each core component under `components/core/` there is:

- `Name.jsx` — the **source of truth** (JSX, `export function`). Uses inline `style={{}}`
  objects that reference CSS token variables (`var(--...)`), never hardcoded colors.
- `Name.d.ts` — the TypeScript contract + doc comments (props, invariants).
- `Name.prompt.md` — a short usage note with JSX examples, for humans/agents.
- an entry in `_ds_bundle.js` — a **hand-maintained** `React.createElement` (no-JSX)
  copy of the same component, exposed as a browser global. The HTML pages load this
  because they transpile with Babel-standalone and cannot import `.jsx` modules.

**When you change a `.jsx` component you must mirror the change in `_ds_bundle.js`** (and
update the `.d.ts` / `.prompt.md` if the API changed). The bundle's header comment states
this explicitly. The HTML pages discover the bundle by scanning `window` for an object
containing known component names — do not rename the exported globals.

### 2. `support.js` is generated — do not edit

`support.js` (the `dc-runtime`) is built from a separate `dc-runtime/` TypeScript project
with `bun run build` and copied in. Its first line says "do not edit." Regenerate upstream
rather than patching it here.

### 3. Tokens are the single styling layer

`styles.css` is the only stylesheet consumers link. It just `@import`s the four token
files, which must stay in this order (fonts → colors → typography → spacing):

- `tokens/colors.css` — base ramps (`--cream-*`, `--brown-*`), brand accents
  (`--terracotta`, `--sage`), the four fixed category colors, then **semantic aliases**
  (`--surface-*`, `--text-*`, `--accent*`, `--border-*`). Author components against the
  semantic aliases, not the raw ramps.
- `tokens/typography.css`, `tokens/spacing.css` (spacing scale, radii, the hard no-blur
  shadows), `tokens/fonts.css` (Onest + Spectral from Google Fonts CDN).

### 4. `@dsCard` annotations register specimen pages

Every specimen/kit HTML file starts with an HTML comment like
`<!-- @dsCard group="Colors" viewport="460x150" name="..." subtitle="..." -->`. This
registers the page as a card in an external DesignCraft-style viewer. Preserve this
first-line annotation when creating or editing specimen pages; follow the existing
`group` / `viewport` / `name` / `subtitle` shape.

## Design invariants (do not violate)

These come from `readme.md` / `SKILL.md` and are load-bearing, not stylistic preferences:

- **Four fixed category colors**, always surfaced through `CategoryTag` / `DayOverviewBar`,
  never reassigned: Общее `#888780`, IT `#2A78D6`, Детская `#E0642A`, Игры `#6B62C0`.
- **No gradients, no blur, no transparency.** The only shadows allowed are the hard
  `0 2px 0` offset "printed sticker" shadow and the soft `--shadow-screen` for the device
  frame.
- **Signature motifs:** sticker tags (card fill, 1.5px color outline, filled color dot,
  hard offset shadow) and cards (1px cream border + hard 2px offset shadow).
- **Type:** Spectral (serif) for display/section titles; Onest (sans) for UI; a mono stack
  for placeholder captions and hour ticks.
- **All copy is Russian.** Sentence case; UPPERCASE only for letter-spaced labels. Middot
  `·` for meta separators, en-dash for ranges, 24-hour time. Emoji only in warm closing
  moments (never in agenda rows, buttons, or tags).
- **No logo or icon set exists.** Do not invent one — render the brand name as type. Icons
  are a small set of Unicode glyphs (`↑ ↓ ✓ · 🌿`), not an icon font.
- Real images go in rounded frames; until supplied, use the diagonal-stripe cream
  placeholder with a mono caption chip — never a hand-drawn illustration.

## Working conventions

- Reference colors/spacing/radii via the CSS token variables, never hardcoded hex or px
  (the category hex values in `CategoryTag`/`CATEGORIES` are the deliberate exception).
- When producing throwaway visual artifacts (mocks, slides), copy assets out and write
  standalone static HTML that links `styles.css`, per `SKILL.md`.
- `assets/` is currently empty — it is where real logo/photo assets go when supplied.
