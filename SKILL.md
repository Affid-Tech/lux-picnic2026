---
name: piknik-design
description: Use this skill to generate well-branded interfaces and assets for the «Пикник» / Beseda Community event brand (warm tactile Russian-language community-event design), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files
(`styles.css` + `tokens/`, `components/core/`, `guidelines/`, `ui_kits/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets
out and create static HTML files for the user to view, linking `styles.css` for tokens.
If working on production code, copy assets and read the rules here to become an expert
in designing with this brand.

Key invariants to respect:
- Four **fixed** program-category colours — Общее `#888780`, IT `#2A78D6`, Детская
  `#E0642A`, Игры `#6B62C0` — always surfaced via `CategoryTag` / `DayOverviewBar`.
- Warm cream paper + terracotta accent; Spectral (display) + Onest (UI); Russian copy.
- Signature motifs: sticker tags (colour outline + dot + hard offset shadow) and cards
  with a hard `0 2px 0` no-blur shadow. No gradients, no blur.

If the user invokes this skill without other guidance, ask what they want to build,
ask a few questions, and act as an expert designer who outputs HTML artifacts *or*
production code depending on the need.
