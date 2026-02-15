# CLAUDE.md

## Project Overview

Francesco's website — a collection of mini-games and interactive pages, deployed as a static site on Firebase Hosting.

**Live URL:** https://strangeryoyo-com.web.app

## Repository Structure

```
strangeryoyo/
├── public/              # Main site HTML pages (Vite root)
├── src/
│   ├── games/           # 16 standalone game apps (React + Vite)
│   ├── adventure1.ts    # Logic for main-site pages
│   ├── gambling.ts
│   ├── guess.ts
│   ├── mandelbrot.ts
│   └── ...
├── scripts/
│   ├── build-all.sh     # Orchestrates full build
│   └── build-game.js    # Builds a single game
├── functions/           # Firebase Cloud Functions (Claude API proxy)
├── dist/                # Build output (deployed to Firebase)
├── vite.config.ts       # Main site Vite config
├── firebase.json        # Firebase hosting + functions config
└── package.json
```

## Architecture

The site is a **multi-page app (MPA)** with two layers:

1. **Main site** — static HTML pages in `public/` built by the root Vite config
2. **Games** — 16 standalone React apps in `src/games/<name>/`, each with their own `vite.config.ts`, `package.json`, and dependencies

### Main Site Pages

| Page | Description |
|------|-------------|
| `index.html` | Landing page |
| `home.html` | Game hub / inventory menu |
| `endangered.html` | Grid of 16 animal game links |
| `guess.html` | Word guessing game |
| `guess_number.html` | Number guessing game |
| `gambling.html` | Slot machine game |
| `mandelbrot.html` | Fractal explorer |
| `adventure1.html` | AI-powered text adventure |

### Games (src/games/)

Each game is a fully standalone React SPA:

arctic-seal, elephant, gorilla, manta, monk-seal, panda, pangolin, rhino, seastar, shark, snow-leopard, tamarin, turtle, vaquita, whale, white-tiger

Every game follows this structure:
```
src/games/<name>/
├── package.json        # Own dependencies (react, vite, etc.)
├── vite.config.ts      # base: './', outDir: ../../../dist/games/<name>
├── index.html          # Entry HTML
├── index.tsx           # React entry point
├── App.tsx             # Main component
├── components/         # Game-specific components
├── services/           # API services (Gemini AI)
├── types.ts
└── node_modules/       # Own node_modules
```

## Commands

```bash
# Dev — main site (pages only, games served from dist/)
npm run dev

# Dev — individual game standalone (runs on port 3000)
GAME=white-tiger npm run dev:game

# Build everything (main site + all 16 games)
npm run build

# Deploy to Firebase
npm run deploy
```

## Dev Workflow

- The main dev server (`npm run dev`) serves pages from `public/` with HMR.
- Game routes (`/games/<name>/`) are served from pre-built files in `dist/games/`. Run `npm run build` first to populate them.
- To actively develop a game, use `GAME=<name> npm run dev:game` which starts the game's own Vite server on port 3000.

## Build Pipeline

`npm run build` runs `scripts/build-all.sh`:
1. Builds main site with `npx vite build` → `dist/`
2. Loops through each `src/games/*/`
3. Runs `scripts/build-game.js <name>` for each, which:
   - Ensures `base: './'` and correct `outDir` in the game's vite config
   - Installs deps if `node_modules/` missing
   - Runs `npm run build` → `dist/games/<name>/`

## Deployment

Firebase Hosting serves `dist/` as a static site. Config in `firebase.json`:
- Static files from `dist/`
- `/api/**` routes proxy to Firebase Cloud Functions
- Cloud function uses Claude API (Haiku) to generate animal quotes

## Key Conventions

- Games use import maps in their HTML for production (esm.sh CDN) — Vite ignores these during dev and bundles everything for the build.
- Games use `process.env.API_KEY` for Gemini API keys, defined via Vite's `define` option from `.env.local` files.
- All game builds use `base: './'` so assets use relative paths (works at any hosting path).
- The `endangered.html` page links to games as `/games/<name>/`.
