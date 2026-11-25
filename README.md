# FOUR YEARS, TWO STARS

Interactive anniversary prototype for Linh Lan x Lan Linh.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment Notes

This repo deploys to GitHub Pages through `.github/workflows/deploy-pages.yml`.
Vite builds with `base: "/fourth_anni/"`, so public runtime assets should be
referenced from CSS/JS as root public paths such as `/cosmos-bg.png` or
`/moon_pics/2022.png`; the production build rewrites them under
`/fourth_anni/`.

Hashed files in `dist/assets` are safe for long browser caching. Public files
with stable names, including `public/cosmos-bg.png` and `public/moon_pics/*.png`,
should be renamed or cache-busted manually if their bytes change after release.

## Prototype Scope

- Vite + React + TypeScript.
- Motion for React for section and UI animation.
- Canvas starfield and cursor trail.
- Fixed Visual Novel overlay system with generated guide portraits.
- localStorage progress, profile, achievements, Starlog, tarot, gacha, and stars.
- Tone.js audio manager skeleton only; audio starts after a user gesture.
- Long-scroll gated journey: Constellation, Scrapbook, Tarot, Gacha, Finale.

## Remaining TODO

- Add real music stems and mood layers inside `src/lib/audioManager.ts`.
- Expand constellation puzzles and hidden Starlog entries.
- Add final assets, QA screenshots, and browser-console regression checks once the in-app browser runtime is available.
