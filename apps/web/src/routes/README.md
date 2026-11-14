# routes

## Overview

TanStack Router file-based routes. `routeTree.gen.ts` in the parent directory is generated from these files by the `tanstackRouter` plugin in `../../vite.config.ts`.

## Interface

- `__root.tsx`: `Route` (`createRootRouteWithContext<RouterAppContext>`) and `RouterAppContext` (empty interface). Sets the document title and description, the `/favicon.svg` link, and renders `Header`, `Outlet`, `ThemeProvider` (`attribute="class"`, `defaultTheme="dark"`, `storageKey="vite-ui-theme"`) and `TanStackRouterDevtools`. Imports `../index.css`.
- `index.tsx`: `Route` for `/` (`createFileRoute("/")`) rendering `HomeComponent`, the Briefing Studio page. It collects a pasted table and an audience from `AUDIENCES`, loads samples with `api.samples()`, and on "Generate brief" calls `api.createBrief` then `api.writeBrief`. It renders `BriefView` and an error `role="alert"`.

## Invariants

- `index.tsx:HomeComponent`: the phase is `"idle" | "analysing" | "writing"`. While it is not `"idle"`, inputs and buttons are disabled (`busy`).
- `index.tsx`: the Generate button is also disabled when `text.trim() === ""`.
- `index.tsx:generate`: if `createBrief` fails, the error is shown and `writeBrief` is not called. If it succeeds, the created brief is shown first, then replaced by the written one.
- `index.tsx:AUDIENCE_HELP` has an entry for every `Audience`.

## Side Effects

- `index.tsx`: network calls via `api` on mount (samples) and on generate/retry.
- `index.tsx:generate` calls `requestAnimationFrame` and `scrollIntoView` on the result container.
- `__root.tsx`: theme persistence via `next-themes` under `vite-ui-theme`; mounts router devtools.

## Verification

- Run: `pnpm --filter web check-types`
- Run: `pnpm test:e2e` from the repository root.
