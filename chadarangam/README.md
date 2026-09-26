# Chaturangam (చతురంగం) — React port

A React + TypeScript rebuild of the Chaturangam/Chess module, restyled to match
**KREEDA**'s shared folk-art design system (the same visual language used by
the Daadi Aata module: aged-paper cream, thick flat maroon outlines, no
gradients/shadows, Fraunces + Manrope + Tiro Telugu type, Kreedu the mascot).

The original dependency-free vanilla-JS build (single `index.html`, no
framework) still lives in [`legacy-vanilla/`](legacy-vanilla/) and remains
fully playable on its own — see `legacy-vanilla/Chaturangam-README.md` for
its technical writeup. This app is a from-scratch UI on top of the *same*
rules/search engine, faithfully ported to TypeScript.

## Running it

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # production build to dist/
npm run lint      # tsc --noEmit
```

## Structure

- `src/utils/chessEngine.ts` — the rules-agnostic board engine (move
  generation, make/unmake, Zobrist hashing, evaluation, iterative-deepening
  search with PVS/null-move/quiescence). Ported 1:1 from
  `legacy-vanilla/engine.js`; no DOM references, pure logic.
- `src/utils/pieceArt.ts` — piece SVG artwork and metadata (ported from
  `legacy-vanilla/pieces.js`), rendered via `components/PieceIcon.tsx` using
  the same `--pc-fill`/`--pc-stroke` theming trick as the original.
- `src/utils/notation.ts` — move notation (SAN for chess, tag notation for
  Chaturangam), ported from `app.js`'s `moveText()`.
- `src/components/GameBoard.tsx` + `GameView.tsx` — the interactive board and
  match screen: selection, legal-move highlighting, captures, promotion,
  check/checkmate/stalemate/bare-king handling, Kreedu's AI turn scheduling.
- `src/components/Header.tsx`, `FolkArtFrame.tsx`, `FolkArtMotifs.tsx`,
  `KreeduMascot.tsx`, `src/utils/soundEngine.ts` — the shared KREEDA design
  system, adapted from the Daadi Aata module (`../Kreeda/Kreeda/src`) with
  Chaturangam-specific branding (chariot-wheel motif in place of the lotus,
  ivory/ebony piece theming in place of P1/P2 pebbles).
- `src/components/HomeView.tsx`, `ModeSelectView.tsx`, `HowToPlayView.tsx`,
  `AboutView.tsx` — the surrounding flow: variant picker, opponent/difficulty/
  side setup, an interactive per-piece movement guide, and the Chaturangam →
  Chess history/comparison page.

## What changed vs. the vanilla build

- Same engine, same rules, same difficulty levels (Sishya / Yodha / Senapati).
- New component-based UI matching the rest of the KREEDA hub instead of its
  own bespoke stylesheet.
- Simplified some vanilla-only conveniences (the FLIP move-slide animation,
  auto-flip-per-turn) that don't translate directly to React's render model;
  everything else — promotion, en passant, castling, bare-king, stalemate
  scoring differences — is intact.
