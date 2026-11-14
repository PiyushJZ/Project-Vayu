# web

## Overview

Civic Air Quality Briefing Studio front end: a Vite + React 19 + TanStack Router single-page app. It calls the server at `/api` on its own origin and imports shared brief types from `../server/src/brief`. In production the server's Worker serves this app's `dist/`.

## Local Interface & Invariants

- `vite.config.ts`: default export `defineConfig` with dev server `port: 3000`, `strictPort: true` and a proxy from `/api` to `http://localhost:8080`, `resolve.tsconfigPaths: true`, and plugins `tailwindcss()`, `tanstackRouter({ target: "react", autoCodeSplitting: true })` and `react()`.
- `package.json` scripts: `dev`, `build`, `serve`, `start`, `check-types` (`vite build && tsc --noEmit`). Browser tests live in `../../e2e` and run from the repository root.
- The app has no environment variables.
- `public/favicon.svg` is copied to the root of `dist/`.
- Invariant: `strictPort: true` makes the dev server fail rather than pick another port if 3000 is taken.
- Side effects: `check-types` runs `vite build`, which writes `dist/`; the router plugin regenerates `src/routeTree.gen.ts`.

## Subdirectories & System Boundaries

- src: [./src/README.md](./src/README.md) - entry point, generated env and route tree, and the components, lib and routes subdirectories.

## Global Invariants

- The server is reached only at the same-origin path `/api` (see `src/lib/api.ts`).
- The generated file `src/routeTree.gen.ts` is not edited by hand.

## Global Side Effects

- HTTP calls to the server (`/api/samples`, `/api/briefs`, `/api/briefs/:id/write`) from `src/lib/api.ts`.
- Browser storage of the theme under `vite-ui-theme` via `next-themes`.

## System Verification

- Run: `pnpm --filter web check-types`
- Run: `pnpm test:e2e` from the repository root
