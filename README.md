# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/miraculous22/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/miraculous22/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: every trophy with its official name, description and grade, a guide in this entry's own words that cites its sources, a roadmap to the platinum, missable flags, filters, a spoiler setting, and progress saved in the browser with export and import. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The app is plain static files under `app/` and works with the network off: it loads nothing from outside `app/`.

## What is inside

- `app/index.html`, `app/app.js`, `app/style.css` — the guide and tracker (no build step, no libraries).
- `app/data/trophies.json` — the official 55 trophies with a cited guide for each, plus kind, chapter, count, missable and roadmap-stage data.
- `screenshots/` — four real renders of the app.
- `main.ts` — hands the entry in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.
- `serve.ts` — a tiny static server for local testing (development convenience only).

## Facts the guide is built on

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden.
- No online trophies and no difficulty trophies; one playthrough; about 200 hours to the platinum.
- One trophy may be missable (Positive Mental Attitude: Lucia's balcony meditation in Chapter 1). There is no mission replay, so the guide tells you which saves to keep.
- Five trophies had no confirmed unlock method at launch and are marked unconfirmed in the guide rather than guessed at.

Sources are named beside every guide in the app and listed in its Sources section: PowerPyx, Push Square, PSNProfiles, Exophase, TrueTrophies, Insider Gaming, Output Lag, Sixshore and GTA VI Vice City Hub.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
