# Durga's docs

Guides, architecture notes, and a learning log for the KREEDA React port.

## Files

| File | What it covers |
|---|---|
| [react-architecture.md](./react-architecture.md) | How the React app is structured — routing, state, component tree |
| [vaikunthapali-port.md](./vaikunthapali-port.md) | How the Vaikunthapali game was ported from a single HTML file into React components |
| [design-system.md](./design-system.md) | The visual language — colors, typography, layout rules |
| [i18n.md](./i18n.md) | How internationalization works across the app and the game |
| [learning-log.md](./learning-log.md) | What was learned, what changed, and why |

## Quick start

```
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Navigate Home → pick a game → Play. Only Vaikunthapali has game logic; the other five show a placeholder.
