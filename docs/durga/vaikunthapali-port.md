# Porting Vaikunthapali from HTML to React

How the standalone `kreeda.html` prototype was decomposed into a React component tree.

## The source

`kreeda.html` is a ~1300-line self-contained file: inline CSS, inline JS, everything. The Vaikunthapali game logic lives in ~850 lines of vanilla JS (lines 459–1308), using direct DOM manipulation — `getElementById`, `classList`, `innerHTML`, `setTimeout` chains.

## What was extracted into components

The monolithic JS was split by responsibility:

| Original JS | React component | Responsibility |
|---|---|---|
| `buildVPBoard()` + `vpSnakeSVG()` + `vpLadderSVG()` | `Board.tsx` | Renders the 10x10 grid, SVG overlays, token positions |
| `renderDie()` + `VP_PIPS` | `Die.tsx` | Renders the 3x3 pip die with roll animation |
| Snake swarm canvas loop (~200 lines) | `SnakeSwarm.tsx` | Full-screen canvas animation, self-contained |
| `initVP()`, `onVPRoll()`, `rollFor()`, `moveEntity()`, `resolveSquare()`, `endOfTurn()`, `scheduleKreedu()`, `winGame()`, `showWinOverlay()` | `Vaikunthapali.tsx` | Everything else — the game state machine |

## The state machine

The game runs on a phase-based state machine stored in React state:

```
idle → rolling → stepping → resolving → idle (or over)
                        ↘ snake-anim → idle
```

- **idle**: waiting for player input (roll button enabled)
- **rolling**: die is shaking, random value chosen (480ms delay)
- **stepping**: token moves square by square (170ms per step)
- **resolving**: landed on a square — check for ladder, snake, or win (620ms delay for ladders/snakes)
- **snake-anim**: full-screen snake swarm canvas is playing (2600ms)
- **over**: game ended, win overlay shown

The original JS used a flat callback chain with `setTimeout`. The React version preserves the same timing but uses refs to guard against stale state after language changes or unmounting. Each entry point receives a `gen` (generation) number — if the generation has changed, the callback bails out.

## AI opponent (Kreedu)

Kreedu's AI is simple: on its turn, wait 850ms, show a random speech bubble 50% of the time, then roll. The speech bubble text is picked from the current language's `bubble.pre` / `bubble.snake` / `bubble.ladder` arrays. The AI has no strategy — it just rolls and follows the same rules.

The AI is scheduled via `scheduleKreedu(gen, delay)` which sets a `setTimeout`. The `gen` check prevents the AI from acting after the player exits or restarts.

## Timer

Solo mode runs a 1-second interval that increments `elapsedRef.current` and calls `setElapsed()`. On win, the elapsed time is compared against the localStorage personal best. The timer is stopped on win, exit, or restart.

The timer uses a ref for the counter value and state for the display — this avoids re-rendering the entire component tree every second while still updating the HUD chip.

## Language switching

The VP game has its own `lang` state (useState + localStorage). When the player switches language mid-game:

1. `saveLang(lang)` writes to localStorage
2. `onLangChange(lang)` notifies the App shell so the HomeView/GameDetailView strings update
3. Board labels, event text, die label, guide content all re-render from the new language's strings
4. The game does **not** reset — positions, turn, timer all persist across language changes

## Guide overlay

The board guide is a modal with three sections: history (about the board), virtue/snake tables, and rules. It uses `dangerouslySetInnerHTML` for the HTML content in rules and the about paragraph — all data comes from `i18n.ts`, not user input.

## Key differences from the HTML version

| HTML prototype | React port |
|---|---|
| Direct DOM manipulation (`getElementById`, `innerHTML`) | React state + component re-render |
| Single `vp` object mutated in place | `useState` for display values, `useRef` for loop internals |
| `setInterval` for timer stored in a global variable | `useRef` for timer ID, cleanup on unmount |
| Language stored in global `vpLang` variable | `useState` + localStorage + LangContext |
| Guide generated as HTML string, injected via `innerHTML` | `<GuideContent>` component with JSX |
| No guard against stale state after language switch | `genRef` check on every setTimeout callback |
| Snake swarm shown via CSS class toggle | `useState` controls conditional rendering |
