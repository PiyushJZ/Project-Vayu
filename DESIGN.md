# Vayu design direction

Recorded from the shipped UI on 2026-11-14 so later work keeps to it. Reasons marked _(confirm)_ were inferred from the code, not stated by the owner; correct them if they are wrong.

Design Read: a civic data studio for ward officers, school staff and housing-society committees, in a plain public-service language.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 2

- ENERGY 1: people use it at work to get a brief they can act on and forward. The page should read like an official notice, not sell anything.
- RHYTHM 2: one grid throughout, broken where the content needs it: the studio split, wide tables, three action cards, the advisory panel.
- MOTION 2: the first screen rises in once on load, buttons lift 1px under a mouse, and disclosure chevrons turn. Nothing loops, and all of it stops under reduced motion.

## Identity

- **Motif:** the 5/7 split. A heading sits in the left five columns and its content starts at column seven, in the studio, every brief section, the note and the advisory.
- **Second motif:** finding chips (`F3`). Every figure in model-written text carries a chip that opens the exact rows it came from. The product's claim is "code computed this, here are the rows", and the chip makes it visible.
- **Focal point:** in the studio, the table box and the Generate brief button. In a brief, the band scale.
- **One accent:** cobalt (light) or sky blue (dark), used only for the primary button, the chosen audience, the finding a chip landed on, and focus rings.

## Colour

- Grounds and ink are cool neutrals: `#eef0f3` with `#0b0c0e` in light, `#0a0d14` with `#e9edf3` in dark. Lines are the ink at fixed strengths, so they hold on both.
- Band colours are the CPCB national index colours, because readers already know them from official bulletins. They are fills only, and the band name always sits beside them in ink.
- Destructive red and caution amber mark errors and data flags, always with words.
- Secondary text holds at least 7:1 on every ground. Checked pairs are in `anti-slop/audit-001-2026-11-14.md`.

## Type

- **Onest** for all interface text: an open sans that stays readable at 13 px labels and 56 px headings _(confirm the reason)_.
- **Noto Sans Devanagari** for the Hindi advisory, with 1.8 line height, because Devanagari needs more room than Latin.
- **JetBrains Mono** only for table cells, row numbers and finding ids, so pasted values line up and read as data, not prose.
- Headings carry weight 400 with tight tracking; size does the work. No uppercase tracked labels.

## Shape and theme

- Radii: 8 px for controls, 12 px for panels and wells, 20 px for cards. Pills only on the circular band dots.
- Shadow is used only for elevation that really exists: the open menu.
- Theme follows the system setting, with Light, Dark and System in the header menu. Most use happens in offices and schools during the day, so neither theme is forced.

## Icons

Lucide, which comes with the shadcn components, for eight utility glyphs only: chevrons for disclosure and menus, a file for opening a table, copy and check, a spinner, and sun and moon for the theme. Each one is the standard sign for its action. The product's identity comes from the motifs above, not from icons.
