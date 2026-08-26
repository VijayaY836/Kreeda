# React architecture

How the Kreeda React app is put together.

## Component tree

```
App                         (view routing, toast, lang provider)
├── HomeView                (game grid, hero section)
├── GameDetailView          (map, pins, instructions, mode toggle)
└── PlayView
    ├── Vaikunthapali       (game orchestrator — state machine, AI, timer)
    │   ├── Board           (10x10 boustrophedon grid, SVG snakes/ladders, tokens)
    │   ├── Die             (3x3 pip renderer with roll animation)
    │   └── SnakeSwarm      (full-screen canvas animation on snake events)
    └── placeholder         (for the other 5 games)
```

## Routing

There is no router library. Navigation is a `View` discriminated union in `App.tsx`:

```ts
type View =
  | { k: 'home' }
  | { k: 'detail'; id: string }
  | { k: 'play'; id: string; mode: PlayMode }
```

`App` renders one of three components based on `view.k`. Transitions happen via `setView(...)`. This is fine for a 3-screen app and avoids a dependency.

## State ownership

| State | Where it lives | Why |
|---|---|---|
| Current view | `App` (useState) | Drives routing for the whole shell |
| Toast messages | `App` (useState + ref timer) | Top-level, needs to appear over everything |
| Language | `App` (useState) + localStorage | Shared across shell and game via LangContext |
| Game mode (solo/mascot) | `GameDetailView` (useState) | Local to the detail screen, passed into Play |
| VP game state | `Vaikunthapali` (useState + useRef) | Everything about the running game: positions, turn, phase, die value, elapsed time, six-count |
| Board data | Static (`vp.tsx`, `games.tsx`) | Never changes at runtime |

The VP game uses a mix of `useState` (for values that drive rendering) and `useRef` (for values that the game loop reads/writes without triggering re-renders). This is deliberate — the stepping animation loop mutates `posRef.current` on every step and only calls `setYouPos` / `setKreeduPos` when a step completes, avoiding 99 re-renders per move.

## Key files

```
src/
├── App.tsx                  Root — view routing, toast, LangContext provider
├── styles.css               All styles (single file, ~323 lines)
├── main.tsx                 ReactDOM entry point
├── data/
│   ├── games.tsx            Game definitions (6 games, icons, pins, instructions)
│   ├── i18n.ts              All translations (VP game strings + shell UI strings)
│   ├── vp.tsx               VP board data (ladders, snakes, SVG renderers, pip map)
│   └── LangContext.tsx       React context for the current language
└── components/
    ├── HomeView.tsx          Home screen with game grid
    ├── GameDetailView.tsx    Game detail (map, pins, instructions, play button)
    ├── PlayView.tsx          Play screen (loads VP game or placeholder)
    └── vp/
        ├── Vaikunthapali.tsx Game orchestrator (state machine, AI, timer, overlays)
        ├── Board.tsx         Board renderer (grid + SVG + tokens)
        ├── Die.tsx           Die renderer (3x3 pip grid)
        └── SnakeSwarm.tsx    Canvas animation (8 inverse-kinematics snakes)
```
