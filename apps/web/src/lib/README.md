# lib

## Overview
HTTP client for the briefing server. `api.ts` wraps `fetch` against `ENV.VITE_SERVER_URL` and shares types with the server via `../../../server/src/brief/types`.

## Interface
- `api.ts:SampleTable` `{ id, label, text }`.
- `api.ts:api.samples()` GET `/samples` returning `SampleTable[]`.
- `api.ts:api.createBrief(text, audience)` POST `/briefs` with `{ text, audience }` returning `Brief`.
- `api.ts:api.writeBrief(id)` POST `/briefs/${id}/write` with `{}` returning `Brief`.

## Invariants
- `api.ts:request` uses GET when `body === undefined`, otherwise POST with `Content-Type: application/json`.
- `api.ts:base` is `ENV.VITE_SERVER_URL` with one trailing slash removed.
- `api.ts:request` throws `Error` on network failure ("Could not reach the server at ..."), and on non-OK responses with the body's `error` or `message`, falling back to `The server returned <status>.`.

## Side Effects
- Network calls to the server through `fetch` (`api.ts:request`). No other state.

## Verification
- Run: `pnpm --filter web check-types` (no test runner is configured).
