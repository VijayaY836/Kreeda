# KREEDA — Bug Audit & Fix Report

**Date:** 2026-08-26
**Scope:** i18n refactoring, language selection modal, gamified dice & player movement animations

---

## Bugs Found & Fixes Applied

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | High | Die.tsx | Hidden die faces (back, left, right, top, bottom) had incorrect pip patterns — wrong numbers flashing during roll animation | All 6 faces now use correct pip mappings based on a standard die where opposite faces sum to 7 |
| 2 | High | Die.tsx | Die showed a blank face (all pips off) on initial render before first roll | Die defaults to face value 1 on initial render so it always looks like a real die |
| 3 | High | styles.css | CSS `transition` and `animation` both targeted `transform` on the die cube, causing a visual judder when the roll animation ended | Removed the CSS `transition` on the die — the animation handles all transform changes cleanly |
| 4 | High | Vaikunthapali.tsx | On three consecutive sixes, the piece still moved 6 squares before the turn was forfeited. Traditional rules void the entire third-six move | Restructured the turn logic so the third consecutive six forfeits the extra roll without advancing the piece |
| 5 | High | Vaikunthapali.tsx | `showSnakeAnimation` stored its 2600ms timeout in a local variable that was never cleared on unmount or restart, causing callbacks to fire on unmounted components | Timeout is now tracked in `snakeTimerRef` and explicitly cleared on unmount, restart, and exit |
| 6 | Medium | Vaikunthapali.tsx | Keyboard event listener was re-attached on every render (no dependency array) because it read live state variables instead of refs | Handler now reads from `phaseRef` and `turnRef`; the effect has an empty dependency array so the listener is attached only once |
| 7 | Medium | Vaikunthapali.tsx | `phaseRef`, `turnRef`, and `langRef` were assigned during the render phase (a side-effect in render) | Moved all three ref assignments into `useEffect` hooks that run after render |
| 8 | Medium | Vaikunthapali.tsx | Guide overlay and win overlay could both be visible simultaneously if the guide was open when a win occurred | Guide modal now checks `!winInfo` before rendering, preventing overlap |
| 9 | Medium | Vaikunthapali.tsx | No cleanup of timers on component unmount — `timerRef` and `bubbleTimerRef` could fire after the component was removed | Added a single cleanup `useEffect` that clears all intervals and timeouts on unmount |
| 10 | Medium | LanguageModal.tsx | No Escape key support — users could only dismiss by clicking the backdrop | Added a `keydown` listener for Escape that triggers the back callback |
| 11 | Medium | LanguageModal.tsx | Modal had no ARIA attributes for screen readers | Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the title |
| 12 | Low | Vaikunthapali.tsx | Dead `setRolls` state — the state value was destructured away and `setRolls` was called solely to trigger re-renders that `setPhase` already caused | Removed the unused `useState` call entirely |
| 13 | Low | Vaikunthapali.tsx | Win overlay had a redundant inline `style={{ display: 'flex' }}` when the CSS class already set `display: flex` | Removed the inline style |
| 14 | Low | Vaikunthapali.tsx | Solo mode called `setTurn('you')` at end of turn even though turn is always `'you'` in solo — a no-op state update | Removed the unnecessary `setTurn` call in the solo branch |

---

## Notes

- **Game logic correctness (#4):** The original implementation advanced the piece on the third six before forfeiting the turn. This deviates from traditional Snakes & Ladders rules where three consecutive sixes result in the piece not moving at all on that third roll. The fix ensures the piece stays in place.
- **Animation timing (#1–3):** The die's 3D tumbling animation exposes all six faces briefly. Having incorrect pip patterns on hidden faces created a noticeable visual glitch. All faces now show mathematically correct die configurations.
- **Memory leaks (#5, #9):** Multiple `setTimeout` and `setInterval` calls were not tracked or cleaned up. While React silently ignores state updates on unmounted components, the closures and timers continued to exist in memory until they fired. All timers are now tracked via refs and cleared on unmount.
- **React correctness (#6, #7):** Reading state variables in effects without including them in the dependency array is a React anti-pattern. The fix uses refs for values that need to be read in callbacks without triggering re-renders, and moves ref assignments into effects.
