# lib

## Overview

HTTP client for the briefing server, and a reader for opened table files. `api.ts` wraps `fetch` against the same-origin path `/api` and shares types with the server via `../../../server/src/brief/types`.

## Interface

- `api.ts:SampleTable`, the server's `Sample` `{ id, label, period, description, text }`.
- `table-file.ts:readTableFile(file)` returns table text: `.csv`/`.tsv`/`.txt` decoded as UTF-8, or Windows-1252 when the bytes are not valid UTF-8; `.xlsx` first sheet written as CSV (shared and inline strings, date-styled cells as `YYYY-MM-DD HH:MM`). Throws a readable `Error` for `.xls` and broken workbooks. `TABLE_FILE_ACCEPT` is the file input's `accept` list.
- `api.ts:api.samples()` GET `/api/samples` returning `SampleTable[]`.
- `api.ts:api.createBrief(text, audience)` POST `/api/briefs` with `{ text, audience }` returning `Brief`.
- `api.ts:api.writeBrief(id)` POST `/api/briefs/${id}/write` with `{}` returning `Brief`.

## Invariants

- `api.ts:request` uses GET when `body === undefined`, otherwise POST with `Content-Type: application/json`.
- `api.ts:base` is the constant `/api`. The Worker serves the app and the API on one origin in production; in development Vite proxies `/api` to `wrangler dev` (see `../../vite.config.ts`).
- `api.ts:request` throws `Error` on network failure ("Could not reach the server. ..."), and on non-OK responses with the body's `error` or `message`, falling back to `The server returned <status>.`.

## Side Effects

- Network calls to the server through `fetch` (`api.ts:request`). No other state.
- `table-file.ts` uses no library: it reads the zip directory itself and inflates parts with the browser's `DecompressionStream("deflate-raw")`, then parses XML with `DOMParser`. ZIP64 workbooks are not supported.

## Verification

- Run: `pnpm --filter web check-types`
- Run: `pnpm test:e2e` from the repository root.
