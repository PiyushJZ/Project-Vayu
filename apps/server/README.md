# server Blueprint

## System Overview

`server` is the HTTP backend of project-vayu: a Cloudflare Worker written with Hono (ESM, TypeScript). The same Worker also serves the built web app from `../web/dist`, so the whole product is one deployment on one origin. It has no source files directly in this directory; all code lives under `src/`. `wrangler.jsonc` holds the Worker's configuration: entry `src/index.ts`, the `nodejs_compat` flag, static assets with single-page-app fallback and `/api/*` routed to the Worker first, the D1 binding `DB` (database `project-vayu`), the rate limit binding `BRIEF_RATE_LIMIT` (20 requests a minute per key), and the `vars` `OPENROUTER_MODEL` and `OPENROUTER_BASE_URL`. `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are passed by the deploy workflow. Scripts in `package.json`: `dev` (`wrangler dev` on port 8080), `build` (`wrangler deploy --dry-run --outdir dist`, bundles without uploading), `deploy` (`wrangler deploy`), `check-types`, `test` (`tsx --test "src/**/*.test.ts"`).

## Subdirectories & System Boundaries

- src: [./src/README.md](./src/README.md) - Worker entry, D1 store, bindings; contains the `brief` domain core and `routes`.

## Global Invariants

- Every API route is under `/api`. Any other path is answered from the web app's files, falling back to `index.html`.
- Configuration comes only from the Worker's bindings (`src/services.ts:Env`). `OPENROUTER_API_KEY` is a secret: locally it is read from `.env` (or `.dev.vars`) in this directory, in production it is set with `wrangler secret put OPENROUTER_API_KEY` or by the deploy workflow.
- Without `OPENROUTER_API_KEY` the API still works: columns are matched by header words and all text is code-written, with the reason shown to the user.
- Briefs are persisted whole as JSON in the D1 `briefs` table (`src/store.ts`). The table is created on first use, so there is no migration step.
- `wrangler.jsonc` has no `database_id`: `wrangler deploy` finds the D1 database by name and creates it on the first deploy.
- LLM text is accepted only if it passes code checks (`src/brief/write.ts:checkText`); otherwise labelled fallback text is used.

## Global Side Effects

- `wrangler dev` listens on port 8080 and keeps the local D1 database under `.wrangler/state`.
- Reads and writes the D1 database bound as `DB`.
- Calls the OpenRouter API (`src/brief/llm.ts`) at `OPENROUTER_BASE_URL`.
- Fetches Cloudflare Access signing keys from `https://<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs` (cached for an hour) when Access is configured.
- Logs one evlog wide event per request, and one `llm_call` line per model attempt, to the console (Workers Logs in production, where `observability` is enabled).

## System Verification

- Run: `pnpm --filter server test`
- Run: `pnpm --filter server check-types`
- Run: `pnpm build` from the repository root (builds the web app, then bundles the Worker)
- Run: `pnpm test:e2e` from the repository root (browser tests against this Worker in `wrangler dev`)
