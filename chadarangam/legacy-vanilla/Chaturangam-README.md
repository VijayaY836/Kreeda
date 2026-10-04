# Chaturangam — Technical README

A single-page, dependency-free web app that plays two games on one board
engine: **Chaturangam** (a reconstruction of 6th-century Gupta-era
Shatranj/Chaturanga) and **modern Chess**. Play against a built-in engine
("Kreedu") at three strengths, or pass-and-play with a friend on the same
screen. Built for the **KREEDA** project (offline Indian traditional games).

---

## 1. Getting it running

No build step, no server, no dependencies.

1. Keep all six files in the **same folder**.
2. Open `index.html` in any modern desktop or mobile browser.

That's it. `index.html` loads the styling and scripts in this order:

```html
<link rel="stylesheet" href="style.css">
...
<script src="engine.js"></script>
<script src="pieces.js"></script>
<script src="tutorial-data.js"></script>
<script src="app.js"></script>
```

The order matters — `app.js` depends on globals declared in the first
three files (no modules/bundler is used; everything is plain global-scope
`<script>` tags).

---

## 2. File map

| File | Lines | Responsibility |
|---|---:|---|
| `index.html` | ~220 | Markup shell only — setup screen, game screen, tutorial sheet, promotion/result modals. No inline logic. |
| `style.css` | ~360 | All visual styling: layout, board theming (CSS custom properties), piece coloring, animations, responsive breakpoints. |
| `engine.js` | ~800 | The rules-agnostic game engine: board representation, move generation, make/unmake, Zobrist hashing, evaluation, and the search (AI). Has **no DOM references** — it's a pure logic module. |
| `pieces.js` | ~120 | Piece SVG artwork (per-variant), piece metadata (names, native-script labels, point values, descriptions), mascot loader. |
| `tutorial-data.js` | ~210 | The in-app "How to play" content — one tutorial-pane array per variant. Pure data (HTML strings), no logic. |
| `app.js` | ~615 | UI state, rendering, user interaction, move animation, AI scheduling, and the tutorial UI plumbing. This is the only file that touches the DOM. |

Total: ~2,300 lines across the six files.

---

## 3. The engine (`engine.js`)

One engine drives both variants; a `Pos.variant` flag (`'chess'` or
`'chaturanga'`) switches move generation, evaluation, and terminal-state
rules where the two games diverge.

### Board representation
- `Int8Array(64)` — index = `rank*8 + file`, `a1 = 0`.
- Positive values = Ivory/White pieces, negative = Ebony/Black.
- Piece codes: `P N B R Q K` (1–6) plus two Chaturanga-only pieces,
  `E` (Gaja/elephant, 7) and `M` (Mantri/counsellor, 8).

### Move encoding
Moves are packed into a single integer for speed:
```
bits 0–5    from square
bits 6–11   to square
bits 12–15  promotion piece type
bits 16–18  flag (0 quiet/capture, 1 double pawn push, 2 en passant, 3 castle)
```

### Move generation & legality
- Pseudo-legal generation per piece type, including variant-specific
  movement: the Gaja leaps exactly two squares diagonally (precomputed
  offset table, `ELEPHANT_T`), the Mantri steps one square diagonally
  (`DIAG1_T`), castling/en passant/double-push only exist for chess.
- Legality is checked by makeMove → `attacked(kingSquare)` → unmakeMove
  (no pin-detection shortcut; simplicity over micro-optimization here).

### Make/unmake
Full make/unmake with an undo stack (`Pos.stack`) storing captured piece,
castling rights, en passant square, halfmove clock, and Zobrist keys —
so `unmakeMove()` is O(1) and the search never copies the board.

### Zobrist hashing
Two independent 32-bit keys (`k1`, `k2`) are maintained incrementally on
every make/unmake for a 64-bit-equivalent hash, used for the
transposition table and repetition detection.

### Evaluation
- Material + piece-square tables (PSTs), tapered between middlegame and
  endgame by a phase counter.
- Chess-only heuristics: bishop pair bonus, doubled/isolated pawn
  penalties, passed-pawn bonus (scaled by rank), rook-on-open-file bonus.
- Chaturanga-only heuristic: since there are no long-range minor pieces,
  pawn (Padati) advance is rewarded quadratically by rank instead — the
  chess passed-pawn logic doesn't apply to a board with no queen.
- A halfmove-clock decay factor gently pulls the score toward 0 as the
  no-progress counter climbs, discouraging pointless shuffling once a
  side is winning.

### Search
Classic engine techniques, all hand-rolled (no external libraries):
- **Iterative deepening** with a time budget per difficulty level.
- **Principal Variation Search** (PVS) with re-search on fail-high.
- **Transposition table** — 2²⁰ entries, always-replace, storing
  score/depth/flag/best-move.
- **Move ordering**: TT move → MVV/LVA captures → promotions → killer
  moves (2 per ply) → history heuristic.
- **Null-move pruning** (reduction 2, or 3 at higher depths) when not in
  check and material remains.
- **Late move reductions** for quiet moves ordered late in the list.
- **Quiescence search** with delta pruning to avoid the horizon effect.
- **Mate-distance pruning** and check extensions.
- Terminal-state handling differs by variant: stalemate is a **draw** in
  chess but a **win for the side that caused it** in Chaturangam
  (following Shatranj rules); "bare king" (every piece but the king
  captured) is a Chaturangam-only win condition, drawn if the reply can
  bare the winning side's king too.

### Difficulty levels (`LEVELS` in `engine.js`)
| Level | Chess (ms / depth / noise) | Chaturanga (ms / depth / noise) |
|---|---|---|
| 1 — Sishya | 120ms / depth 2 / noise 70 | 120ms / depth 2 / noise 60 |
| 2 — Yodha | 600ms / depth 8 / noise 0 | 450ms / depth 8 / noise 0 |
| 3 — Senapati | 1500ms / depth 24 / noise 0 | 1200ms / depth 24 / noise 0 |

"Noise" at level 1 adds random jitter to root-move scores so the weakest
setting plays like a hurried beginner instead of a shallow-but-precise
engine.

---

## 4. Piece artwork (`pieces.js`)

- `getArt(variant, letter)` resolves art per variant: a `chess`/
  `chaturanga` override table (`ART_VARIANT`) is checked first, falling
  back to a shared table (`ART_BASE`) for pieces that are visually
  identical between variants.
- **Chess** pieces use the standard **Cburnett** SVG set from Wikimedia
  Commons (`Category:SVG chess pieces`, CC BY-SA 3.0 / GFDL), retraced
  to use `var(--pc-fill)` / `var(--pc-stroke)` in place of the original's
  hard-coded colors so Ivory/Ebony theming works the same way as every
  other piece on the board. Attribution: Colin M.L. Burnett
  (Wikimedia user Cburnett) and contributors.
- **Chaturangam** pieces (Raja, Mantri, Gaja, Ashva, Ratha, Padati) are
  original hand-drawn SVGs designed for this project, deliberately
  distinct from the modern set — most notably, the Raja wears a
  jewelled turban with **no cross** (a Christian-iconography element
  that has no place on a 6th-century Gupta court; the cross only enters
  the piece's history with the later European Staunton design).
- Pawns render smaller than the other pieces via a `.piece-pawn` CSS
  class — applied only for Chaturangam, since the Cburnett chess set
  already draws its own pawn proportionally smaller within its native
  canvas.

---

## 5. Rendering & interaction (`app.js`)

- `render()` fully rebuilds the 64-square board on every state change
  (no virtual-DOM diffing) — simple and fast enough at this scale.
- **Move animation**: since the board is rebuilt each move, a moved
  piece has no continuous DOM node to transition. `slidePieceIn()`
  implements a lightweight FLIP animation instead — it records the
  departure square's on-screen position *before* `render()` runs, then
  offsets the newly-rendered piece back to that position and lets a CSS
  transition (`.5s`, custom cubic-bezier) ease it home. A **double
  `requestAnimationFrame`** is used before starting the transition,
  which avoids a common gotcha where the browser coalesces the "start"
  and "end" style writes into a single frame and the animation never
  visibly plays. Castling animates the rook the same way, in parallel.
- **AI turns**: `scheduleAI()` calls into `bestMove()` (in `engine.js`)
  off the render path via `setTimeout`, so the "thinking" UI state can
  paint before the (synchronous, blocking) search runs.
- **Accessibility**: every square is a keyboard-focusable
  `role="button"` with a descriptive `aria-label`; the move log and
  status line use `aria-live="polite"`; `prefers-reduced-motion: reduce`
  disables all transitions/animations globally via CSS.

---

## 6. Variant differences at a glance

| | Chaturangam | Chess |
|---|---|---|
| Board | Ashtapada (uncheckered by default) or checkered — togglable | Checkered |
| Back rank | Ratha, Ashva, Gaja, **Raja, Mantri**, Gaja, Ashva, Ratha (mirrored — Raja faces Raja) | Rook, Knight, Bishop, **Queen, King**, Bishop, Knight, Rook (rotated — queens on own color) |
| Queen-equivalent | Mantri — one square diagonally | Queen — any distance, any direction |
| Bishop-equivalent | Gaja — leaps exactly two squares diagonally | Bishop — slides the full diagonal |
| Pawn | No two-square first move → no en passant | Two-square first move → en passant possible |
| Promotion | Padati → Mantri only | Pawn → player's choice of piece |
| Castling | None | Both sides, kingside/queenside |
| Stalemate | **Win** for the side that caused it | **Draw** |
| Bare king (all other pieces captured) | Win (draw if the reply can bare you too) | Not a rule |

---

## 7. Known constraints / things to know before extending

- **No module bundler** — adding a new file means adding a new
  `<script src="...">` tag in `index.html`, in dependency order.
- **No `localStorage`/persistence** — game state resets on reload; this
  is by design (kept dependency-free and privacy-clean for an offline
  app), not a bug.
- Search is single-threaded and synchronous (`setTimeout`-deferred only
  to let the UI paint first), so Level 3 (~1.2–1.5s) will briefly block
  the main thread on lower-end devices.
- The transposition table is cleared only on `Restart`/`New game`
  (`ttClear()`), not between AI moves within the same game.

---

## 8. Credits

- Chess piece artwork: **Cburnett** (Colin M. L. Burnett) via
  Wikimedia Commons, `Category:SVG chess pieces`, CC BY-SA 3.0 / GFDL.
- Everything else (engine, Chaturangam artwork, UI, tutorial content):
  original work for the **KREEDA** project.