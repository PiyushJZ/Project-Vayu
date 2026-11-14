# src

## Overview

Entry point and wiring of the `server` Worker: the Hono app, the Worker's bindings, the D1 store, and the route and domain subdirectories.

## Interface

- `index.ts` - Worker entry; default export is the Hono app, mounted at base path `/api`. Registers the evlog middleware, security headers and `Cache-Control: no-store`, `GET /api/health` returning `"OK"`, then `access.ts:requireAccess`, a 1.5 MB body limit and `access.ts:rateLimit` on `/briefs/*`, and `briefRoutes`.
- `access.ts:requireAccess` - verifies the `Cf-Access-Jwt-Assertion` token (RS256, issuer and audience) against the team's Access certs when `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are set; otherwise passes every request. `access.ts:rateLimit` - calls `BRIEF_RATE_LIMIT` for each POST, keyed on the Access user or the client address; answers 429 when over.
- `services.ts:Env` - the Worker's bindings: `DB`, optional `BRIEF_RATE_LIMIT`, optional `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`, optional `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD`.
- `services.ts:servicesFor(env): Services` returning `{ store, llm }`; `services.ts:Services` is what the brief pipeline takes.
- `store.ts:openStore(db: SqlDatabase): Store` returning `{ insert, update, get, latest }`, all async; `store.ts:Store` type.
  - `insert(brief: Omit<Brief, "id">): Promise<Brief>`, `update(brief)`, `get(id): Promise<Brief | null>`, `latest(): Promise<Brief | null>`.
- `store.ts:SqlDatabase` / `SqlStatement` - the part of Cloudflare's `D1Database` the store uses (`prepare`, `bind`, `run`, `first`).
- Subdirectories:
  - [./brief/README.md](./brief/README.md) - parsing, analysis, comparison, LLM writing.
  - [./routes/README.md](./routes/README.md) - HTTP routes.

## Invariants

- `store.ts:openStore` keeps each brief whole as JSON in `briefs.data`; separate columns are `id`, `created_at`, `audience`.
- `store.ts:insert` is a single `INSERT ... RETURNING id`. The `id` column is the source of truth: `get` and `latest` overwrite the `id` in the stored JSON with it.
- `store.ts:ensureTable` runs `CREATE TABLE IF NOT EXISTS briefs` once per database object (once per Worker isolate) before any query, and forgets a failed attempt so the next request retries.
- `store.ts:latest` orders by `id DESC` (latest means highest id).
- `index.ts:onError` turns a `brief/pipeline.ts:UserError` into its `statusCode` (404 or 422) with `{ error: message }`; any other error is logged and answered with a generic 500 `{ error }`. Unknown `/api` paths return 404 `{ error }`.
- `services.ts:servicesFor` treats an empty `OPENROUTER_API_KEY` as unset and strips trailing slashes from `OPENROUTER_BASE_URL`.
- No module reads `process.env` or keeps per-request state at module level; everything a request needs comes from `servicesFor(c.env)`.

## Side Effects

- `store.ts` reads and writes the D1 database it is given.
- `index.ts` calls `initLogger` (service `project-vayu-server`) when the Worker starts; the evlog middleware writes one event per request to the console.

## Verification

- Run: `pnpm --filter server test`
- Run: `pnpm --filter server check-types`
