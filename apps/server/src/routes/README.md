# routes

## Overview
Fastify route plugins for the HTTP API. Currently a single plugin that exposes the sample tables and the two-step brief workflow (create statistics, then write text).

## Interface
- `briefs.ts:briefRoutes(app: FastifyInstance)` - Fastify plugin registered from `../index.ts`. Routes:
  - `GET /samples` - returns `SAMPLES` from `../brief/samples`.
  - `POST /briefs` - body `{ text: string (1..300000 chars), audience: one of AUDIENCES }`; returns `createBrief(store, body)`.
  - `POST /briefs/:id/write` - `id` coerced to a positive integer; returns `writeForBrief(store, id)`.

## Invariants
- `briefs.ts:CreateBody` (zod) validates `text` length and `audience`; invalid input returns HTTP 400 with `{ error: "Send the table text and choose who the brief is for." }`.
- `briefs.ts:IdParams` invalid id returns HTTP 400 with `{ error: "Invalid brief id." }`.
- Errors thrown by `createBrief`/`writeForBrief` are not caught here; `../brief/pipeline.ts:UserError` carries a `statusCode` (422 or 404) for Fastify to use.
- Uses the shared `store` singleton from `../services`.

## Side Effects
- `POST /briefs` inserts a row in the SQLite store and may call OpenRouter (column mapping) through `createBrief`.
- `POST /briefs/:id/write` calls OpenRouter and updates the stored brief through `writeForBrief`.
- `GET /samples` has no side effects.

## Verification
- Run: `pnpm --filter server test` (no route-level tests; the underlying pipeline is covered in `../brief/brief.test.ts`)
- Run: `pnpm --filter server check-types`
