# Leonida Nights — GTA-style Cover Poster Generator

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/azizfai/gta6-cover-art-01-v3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/azizfai/gta6-cover-art-01-v3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Leonida Nights** is a one-click poster generator that paints finished GTA 6-style
cover art — no photo needed, no upload, no account. Pick a template, hit
**Generate**, and you get a print-ready-feeling poster with bold title lettering,
a sunset or neon colour grade, halftone + film-grain texture, and a shareable seed
(the same seed always paints the same poster).

Built for the [make.fun](https://make.fun) competition
**gta6-cover-art-01** ("Make GTA 6 Cover Art"). Referral code: `p5tm223q`.

## What it makes

Four fully procedural poster templates, every pixel drawn in code (no photos,
no downloaded assets, system fonts only):

- **Sunset Chase** — orange/pink gradient sky, a big slit sun, a highway with a
  low car silhouette and headlight glow, palm silhouettes, distant skyline.
- **Neon Nights** — deep purple night sky, a glowing neon-pink sun ring, lit
  skyline windows, wet-street reflections, two figures walking.
- **Beach Heist** — teal sea and sand, a speedboat with a wake, palms, gulls, a
  duffel bag and a figure on the shore.
- **Skyline Dawn** — pale gold dawn sky, a full skyline with antenna lights,
  birds, a helicopter, and a water reflection.

Two GTA-style character silhouettes (a man in a jacket, a woman with flowing
hair) are drawn as vector paths in every poster.

## Features

- **Seeded variation** — Generate re-rolls the composition (sun position, palm
  placement, skyline density, bird count, grain) from a seed; the seed is shown
  and shareable.
- **4 colour grades** — Warm Sunset, Neon Night, Black & White, Faded Vintage.
- **Editable title, subtitle and tagline** — heavy outlined lettering in the
  genre's style, plus a halftone + film-grain texture toggle.
- **Your photo, optionally** — load a photo and it appears as a tilted polaroid
  snapshot on the poster, with zoom and position sliders to crop it. Photos are
  read on your machine and never uploaded.
- **Gallery** — 12 posters from different seeds; click one to load it.
- **Export PNG** — 1080×1080 (square), 1080×1350 (portrait), 1920×1080
  (landscape), real downloadable PNG files.

## Run it

No build step, no dependencies, works fully offline:

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server and open `app/index.html`.

## Files

- `main.ts` — entrypoint: copies `app/` + `screenshots/` to the output dir and
  writes `dossier.json` (`MAKEFUN_OUTPUT_DIR=out node main.ts`).
- `app/index.html`, `app/style.css` — page and dark gallery UI.
- `app/src/main.js` — bootstrap, state, seed handling, gallery, controls.
- `app/src/poster.js` — the four poster templates and the title block.
- `app/src/art.js` — canvas drawing primitives (sky, sun, skyline, palms, car,
  figures, birds, water, halftone, grain).
- `app/src/grades.js` — the four colour grades.
- `app/src/shots.js` — screenshot scenes (`?shot=cover` / `?shot=editor`) and
  PNG export helpers.
- `serve.ts` — tiny static server for local preview (localhost only).
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged.

## Screenshots

- `1-cover.jpg` — a finished Sunset Chase poster (landscape).
- `2-editor.jpg` — the generator UI with a poster and the gallery.
- `3-cover.jpg` — a finished Neon Nights poster (square).
- `4-cover.jpg` — a finished Beach Heist poster (portrait).

All art is original and drawn in code. No Rockstar Games logo, official
artwork, character or font is used.

## License

MIT — see [LICENSE](LICENSE).
