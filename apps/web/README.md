# web

## Overview
Civic Air Quality Briefing Studio front end: a Vite + React 19 + TanStack Router single-page app. It talks to the server over HTTP and imports shared brief types from `../server/src/brief`.

## Local Interface & Invariants
- `vite.config.ts`: default export `defineConfig` with dev server `port: 3000` and `strictPort: true`, `resolve.tsconfigPaths: true`, and plugins `varlockVitePlugin({ ssrInjectMode: "auto-load" })`, `tailwindcss()`, `tanstackRouter({ target: "react", autoCodeSplitting: true })` and `react()`.
- `package.json` scripts: `dev`, `build`, `serve`, `start`, `check-types` (`vite build && tsc --noEmit`), `env:generate` (`varlock codegen`). No test script exists.
- Env schema `.env.schema` declares `NODE_ENV` and `VITE_SERVER_URL` (url, required); types are generated into `src/env.ts`.
- Invariant: `strictPort: true` makes the dev server fail rather than pick another port if 3000 is taken.
- Side effects: `check-types` runs `vite build`, which writes `dist/`; the router plugin regenerates `src/routeTree.gen.ts`.

## Subdirectories & System Boundaries
- src: [./src/README.md](./src/README.md) - entry point, generated env and route tree, and the components, lib and routes subdirectories.

## Global Invariants
- Server URL comes only from `ENV.VITE_SERVER_URL` (see `src/lib/api.ts`).
- Generated files `src/env.ts` and `src/routeTree.gen.ts` are not edited by hand.

## Global Side Effects
- HTTP calls to the server (`/samples`, `/briefs`, `/briefs/:id/write`) from `src/lib/api.ts`.
- Browser storage of the theme under `vite-ui-theme` via `next-themes`.

## System Verification
- Run: `pnpm --filter web check-types`
