# e2e

## Overview

Playwright browser tests for the whole product. They drive the built web app as served by the Worker in `wrangler dev`, which is the same arrangement as production: one origin, API under `/api`, a local D1 database. OpenRouter is replaced by a small stub, so the tests need no API key and always see the same text.

## Interface

- `studio.spec.ts` - the tests: page load, a model-written brief with citations, the advisory in two languages and two reading levels, comparison with the previous brief, an unusable table, model failure and retry, theme, API/page routing, and a phone-width layout check (tagged `@mobile`).
- `mock-openrouter.mjs` - the OpenRouter stub on port 8788. `POST /chat/completions` answers the column-mapping and writing prompts with replies that pass every check in `apps/server/src/brief/write.ts`. `POST /__control` with `{ "failWrites": true }` makes the writing call return 503. `GET /health` is for Playwright's readiness check.
- `worker.env` - the Worker's local values for a test run (a dummy key and the stub's address). It holds no real secret and is committed.
- `../playwright.config.ts` - starts the stub and the Worker (port 8787, database in `apps/server/.wrangler/e2e`, wiped at each start), and defines the `desktop` project (all tests) and the `mobile` project (`@mobile` tests only).

## Invariants

- Tests run one at a time (`workers: 1`): they share one Worker, one database and one stub.
- A test must not depend on which briefs already exist. Brief ids are read from the page, never assumed.
- A test run never uses `apps/server/.env`: `wrangler dev --env-file` replaces it, so the real OpenRouter key is not read and no real model call is made.
- The web app must be built before the tests start. `pnpm test:e2e` does this; `pnpm exec playwright test` alone does not.

## Side Effects

- Listens on ports 8787 and 8788 for the length of a run. Locally an already running pair is reused.
- Writes `test-results/` and, in CI, `playwright-report/` (both gitignored).

## Verification

- Run: `pnpm test:e2e` from the repository root (first time: `pnpm exec playwright install chromium`)
- Run: `pnpm check-types` (includes `tsc --noEmit -p e2e`)
