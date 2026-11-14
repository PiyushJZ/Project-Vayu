# routes

## Overview

Hono routes for the HTTP API. Currently a single sub-app that exposes the sample tables and the two-step brief workflow (create statistics, then write text).

## Interface

- `briefs.ts:briefRoutes` - a `Hono<{ Bindings: Env }>` sub-app mounted from `../index.ts`, so every path below is under `/api`. Routes:
  - `GET /api/samples` - returns `SAMPLES` from `../brief/samples`.
  - `POST /api/briefs` - body `{ text: string (1..300000 chars), audience: one of AUDIENCES }`; returns `createBrief(services, body)`.
  - `POST /api/briefs/:id/write` - `id` coerced to a positive integer; returns `writeForBrief(services, id)`.

## Invariants

- `briefs.ts:CreateBody` (zod) validates `text` length and `audience`; invalid input, including a body that is not JSON, returns HTTP 400 with `{ error: "Send the table text and choose who the brief is for." }`.
- `briefs.ts:IdParams` invalid id returns HTTP 400 with `{ error: "Invalid brief id." }`.
- Errors thrown by `createBrief`/`writeForBrief` are not caught here; `../index.ts:onError` turns `../brief/pipeline.ts:UserError` into its `statusCode` (422 or 404) with `{ error: message }`.
- Each request builds its own store and model config with `../services.ts:servicesFor(c.env)`.

## Side Effects

- `POST /api/briefs` inserts a row in the D1 store and may call OpenRouter (column mapping) through `createBrief`.
- `POST /api/briefs/:id/write` calls OpenRouter and updates the stored brief through `writeForBrief`.
- `GET /api/samples` has no side effects.

## Verification

- Run: `pnpm --filter server test` (no route-level unit tests; the underlying pipeline is covered in `../brief/brief.test.ts`)
- Run: `pnpm test:e2e` from the repository root (exercises every route through the browser)
- Run: `pnpm --filter server check-types`
