# Learning log

What was built, what was learned, and what changed along the way.

---

## 2026-08-26 — React port: VP game orchestrator + shell i18n

### What was done

- Created `Vaikunthapali.tsx` (~310 lines) — the missing game orchestrator that the React app was importing but didn't exist. Without it the app wouldn't compile.
- Ported all game logic from the 850-line vanilla JS block in `kreeda.html` into a React component with proper state management.
- Added full 4-language i18n to the shell UI (Home, Detail, Play views) — previously only the VP game board had translations.
- Created `LangContext` to share language state between the App shell and game components.

### What was learned

**DOM-to-React migration is not just syntax translation.** The HTML prototype used a flat mutable `vp` object and direct DOM manipulation. The React version needed a fundamentally different approach:

- Display values (positions, die value, event text) become `useState` — they drive rendering.
- Internal loop values (generation counter, six-count, timer ID, position during stepping) become `useRef` — they change frequently but shouldn't trigger re-renders on every mutation.
- The stepping animation loop (move token 170ms at a time) was the trickiest part. In the HTML version it mutates `vp.pos[e]` on every step. In React, I kept `posRef.current` as the source of truth during the loop and only called `setYouPos()` / `setKreeduPos()` when the final position was reached. This avoids 99 re-renders per move while still updating the board at the end.

**Stale closures are the real danger in React game loops.** Every `setTimeout` callback needs to check whether the game has been restarted or the language changed. The `genRef` pattern (increment on restart, check before every callback) solved this cleanly. Without it, switching language mid-game would crash because callbacks would reference old language strings.

**Two i18n layers is the right split for this app.** The VP game strings are huge (~80 fields per language) and deeply intertwined with game logic. The shell strings are small (~17 fields) and simple. Keeping them separate means the game component can manage its own language state (for mid-game switching) while the shell uses a shared context. The alternative — one giant context for everything — would have been over-engineered.

**The `onLangChange` callback pattern keeps things in sync without over-coupling.** The VP game owns its language state, but notifies the App shell when it changes. This way the shell re-renders in the new language without controlling the game's language. Simple, one-way data flow.

### What was removed

- Unused `rolls` state variable (was declared but never read — the count was tracked in a ref instead). Replaced with `const [, setRolls] = useState(0)` to keep the setter for potential future use.

### Design decisions

- **No new dependencies.** The entire i18n system is a plain object lookup + a `fmt()` template function. No i18n library needed for 4 languages and ~100 fields.
- **`dangerouslySetInnerHTML` kept for guide content.** The board guide has rich HTML (bold text, tables). Since all content comes from `i18n.ts` (not user input), this is safe. An alternative would be to split every bold span into JSX fragments, which would triple the guide data size for no real safety gain.
- **Snake swarm animation kept as a separate component.** The canvas animation is self-contained (~260 lines) with its own lifecycle. Wrapping it in a component with conditional rendering (`showSnakeSwarm && <SnakeSwarm />`) means it mounts/unmounts cleanly and doesn't run when not needed.

---

## Prior commits (from git log)

| Commit | What it added |
|---|---|
| `a9c38ef` | Authentic Moksha Patam board: 100 squares in boustrophedon order, SVG snakes and ladders, Telugu numerals |
| `aec5bf1` | Die rolls, turn system, Kreedu AI opponent, three-sixes rule |
| `67937cb` | Solo timer with best time, win overlay, board guide modal |
| `e1bb5ae` | 4-language switcher (te/en/hi/ta), localized board labels |
| `924139b` | Localized events, Kreedu quips, win screens, full guide in all 4 languages |
| `c95a21d` | README updated with language support note |
| `7cd26ce` | Fixed square text overlapping via flex cell layout and `cqi` type scale |

---

## What's next

- Port the remaining 5 games (Puli Meka, Ashta Chamma, Vaamana Guntalu, Chaturangam, Daadi Aata) — each needs its own board, rules, and AI behavior.
- Kreedu AI could be smarter — right now it just rolls randomly. For strategy games like Puli Meka or Chaturangam, it needs actual decision-making.
- Consider `useReducer` for the VP game state — as more games are added, the `useState` + `useRef` combo may become hard to reason about.
- Push the `durga/vaikunthapali` branch — it's 4 commits ahead of remote and has never been pushed.
