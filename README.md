[![GTA 6 Trophy Guide — make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/miraculous22/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/miraculous22/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: the official names, descriptions and grades, a checklist that saves in your browser, a roadmap to the platinum, the missables flagged, and a guide to every trophy in our own words. It runs from its own files with the network off — no account, no ads, no Rockstar artwork.

## What it does

- **Checklist** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with official names, descriptions and grades. Tick trophies off; progress saves in localStorage and shows as a bar and per-grade counts.
- **Filters** — search by name or description, filter by grade and kind (story, activities, collectibles, exploration, combat, side), missable-only and earned-only views.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until you earn them.
- **Roadmap to the platinum** — four stages in play order (story, activities, collectibles, cleanup), each with its own progress.
- **Missables** — the trophies whose descriptions point at a single story moment that may not repeat, flagged from the official descriptions alone.
- **Export and import** — save your progress to a JSON file and load it back on any machine.
- **Guides with sources** — every trophy's guide is our own advice written from its official description, and each one names its sources beside it.

## Run it

Any static server with `app/` at its root, for example:

```sh
node serve.ts
```

then open http://localhost:8080. Or serve `app/` with any static file server and open `index.html`.

## Hand it in

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions, grades and hidden flags are the official PlayStation 5 list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi); the two agree on every name, description and grade, and the counts PlayStation tracks (such as 42 Shooting Range challenges) come from the same lists. Every guide is our own words, written from the official descriptions. The game is a day old and nothing here has been checked in the game yet — where a guide rests on a reading of a description rather than a confirmed fact, it says so.

## License

MIT — see [LICENSE](LICENSE).
