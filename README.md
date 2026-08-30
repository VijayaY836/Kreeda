# KREEDA

**Six ancient Indian games. Six journeys across the world. One board each.**

KREEDA is a hackathon project reimagining traditional Indian board games as a single, offline-first hub — styled after the "100 offline games" app format, but with a twist: every game comes with a map showing where it traveled, what it's called there today, and how it got there.

---

## Concept

Each of the six games featured originated in India. Some stayed close to home; others crossed oceans and came back under completely different names. Tapping a game opens an illustrated map — tap a pin, and a dialog reveals the local name of the game there, a fun fact, and the story of how it arrived. Below the map: plain-language instructions, then a Play button that drops you into the game itself.

Every two-player game is playable against **Kreedu**, KREEDA's mascot — who doubles as the built-in AI opponent, so the app needs no network connection and no second player to be fully playable.

## The 6 games

| Game | Also known as | Mode |
|---|---|---|
| **Vaikunthapali** (వైకుంఠపాళి) | Gyan Chauper, Moksha Patam → Snakes and Ladders | **Solo or vs. Kreedu** |
| **Puli Meka Aata** (పులి మేక ఆట) | Aadu Puli Aatam, Bagh-Chal | vs. Kreedu |
| **Ashta Chamma** (అష్ట చెమ్మ) | Chowka Bara, Daayam, Vimanam | vs. Kreedu |
| **Vaamana Guntalu** (వామన గుంటలు) | Pallanguzhi | vs. Kreedu |
| **Chaturangam** (చతురంగం) | Chadarangam, Shatranj → Chess | vs. Kreedu |
| **Daadi Aata** (దాడి ఆట) | Navakankari, Nine Men's Morris | vs. Kreedu |

Five games get a map with a stitched-thread path tracing their journey out of India. **Daadi Aata is the deliberate exception** — historical evidence suggests it arose independently in several ancient civilizations (India, Egypt, Rome) rather than spreading from one origin, so its map shows scattered pins with no connecting path. That's not a bug — it's the honest version of the story.

## Priorities

- **Low dependency** — the prototype is a single self-contained HTML file; no build step, no framework, no external services.
- **Offline availability** — every game is playable against Kreedu with zero network connection.
- **Impeccable UI** — a flat, hand-illustrated folk-art visual language, built around one consistent design system so all six games feel like one product, not six stitched-together mini-apps.

## What's in this prototype

This build is the **structural/navigational skeleton**, not the finished games. It's meant to prove the full flow end to end and give the team one visual source of truth to build actual game logic into.

Included and working:
- Home screen with Kreedu and a grid of all 6 games that are available
- Game detail screen per game: mode toggle (where applicable), illustrated map with clickable pins, tap-to-open fact dialogs, how-to-play instructions, Play button
- Navigation between Home → Game Detail → Play (placeholder) screens
- Real content for every game: accurate pin locations, fun facts, and "how it traveled" notes for all 6 games, pulled from actual research — not placeholder text
- Kreedu, the mascot, rendered as a transparent-background illustration on the home screen and the play placeholder

Not yet built:
- Actual game boards and logic for any of the 6 games
- Kreedu's AI opponent behavior
- Real geographic map data (pins are placed on a stylized illustrated map, not real coordinates)
- Additional mascot poses/expressions (win, lose, thinking, idle)
- Multiplayer (planned for a future iteration, per the original scope)

## Files

- `kreeda_prototype.html` — the full prototype. Open directly in any browser, no server needed.
- `kreedu-mascot.png` — Kreedu's mascot illustration, transparent background. Must stay in the same folder as the HTML file, since it's referenced by relative path.

## Design system

- **Base surface:** warm aged-paper cream (`#EFDFB8`)
- **Structure:** thick (3px) solid maroon (`#5C140F`) outlines carry all depth — no shadows, no blur, no gradients anywhere in the UI
- **Palette:** one flat, saturated color per game — cloud blue, terracotta, marigold, leaf green, peacock teal, lotus pink — plus maroon and cream as the constants
- **Type:** Fraunces (bold, display/headers) paired with Manrope (body/UI text)
- **Icons:** flat, thick-stroke, single-color, sitting directly on each game's color tile
