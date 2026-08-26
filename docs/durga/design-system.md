# Design system

The visual language of KREEDA — a folk-art, hand-illustrated aesthetic built on flat color and thick outlines.

## Principles

1. **No shadows, no blur, no gradients.** Depth comes from thick borders and flat color contrast alone.
2. **One saturated color per game tile.** Each game gets a single, bold, flat color as its identity — no mixes.
3. **Thick maroon outlines carry structure.** The 3px solid `#5C140F` border is the primary structural element across every component — cards, panels, buttons, the board itself.
4. **Aged paper as base.** The warm cream surface evokes old manuscript paper, tying the folk-art aesthetic together.

## Palette

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#EFDFB8` | Base background, card interiors, die face |
| `--paper-deep` | `#E4D19E` | Panel backgrounds, alternate board squares |
| `--maroon` | `#5C140F` | All borders, text headings, structural lines |
| `--terracotta` | `#D8401F` | Play buttons, active mode toggle, snake vice labels |
| `--marigold` | `#EFA90C` | Kreedu speech bubbles, origin pin color, timer chip |
| `--teal` | `#0E5C58` | Hero background, guide button |
| `--blue` | `#3E6E9E` | Player token, Vaikunthapali tile, map background |
| `--green` | `#5F8F3B` | Virtue/ladder labels |
| `--pink` | `#D9587B` | Daadi Aata tile |
| `--ink` | `#2B1B12` | Body text, die pips |
| `--ink-soft` | `#6B4E3D` | Secondary text, ladder rail color |

## Typography

- **Fraunces** (serif, weight 800): Display headings, game names, section titles, die face, buttons
- **Manrope** (sans-serif, weights 400–800): Body text, UI labels, chips, captions

Both loaded from Google Fonts. No local font files.

## Board-specific rules

The VP board uses CSS container queries (`container-type: size`) so all cell text sizes scale relative to the board width via `cqi` units. This means the board looks correct at any viewport size without media queries.

Token positions are percentage-based (matching the SVG `viewBox` coordinate system), so tokens sit exactly on their squares regardless of board size.

## Component patterns

- **Cards** (`.card`): flat color background, thick maroon border, hover lifts 3px, active presses down. Badge chip at bottom-left, "Explore →" text at bottom-right.
- **Panels** (`.panel`): `--paper-deep` background, rounded corners, maroon border. Used for map containers, instructions, and the play placeholder.
- **Chips** (`.vp-chip`): inline label pills for HUD info (position, timer). Active state switches to marigold background.
- **Buttons**: two styles — filled (terracotta, white text) and ghost (paper background, maroon text). Both get maroon borders and hover lift.
- **Overlays**: fixed fullscreen with 62% dark ink background. Modals sit centered inside with paper background and maroon border.

## Spacing

No spacing scale or design tokens. Spacing is ad-hoc per component, generally in 4–6px increments. Margins between sections are typically 18–22px. The shell has a max-width of 1180px with 20px horizontal padding.
