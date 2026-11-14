# brief

## Overview

Domain core of the Vayu server. It turns a pasted air quality table into a stored `Brief`. Code parses the table, maps columns (model first, header matching as fallback), computes every statistic, flags unreliable rows, picks a CPCB-based band and compares with the previous brief. A second, separate step asks an LLM (OpenRouter) only for wording, and rejects any text that does not pass code checks.

Files: `types.ts` (shared types), `table.ts` (parsing), `mapping.ts` (model column mapping), `analyze.ts` (statistics and findings), `compare.ts` (comparison with previous brief), `bands.ts` (bands and fixed guidance), `llm.ts` (OpenRouter client), `write.ts` (written output and validation), `pipeline.ts` (orchestration), `samples.ts` (bundled sample tables).

## Interface

- `pipeline.ts:createBrief({ store, llm }, { text, audience }, map = mapColumns): Promise<Brief>` - parse, map, analyze, save with `status: "stats"`, `written: null`.
- `pipeline.ts:writeForBrief({ store, llm }, id): Promise<Brief>` - loads the brief, calls `writeBrief`, stores `written`/`writeError`, sets `status` to `"written"` or `"fallback"`.
- `table.ts`: `parseTable`, `parseNumber`, `parseTimestamp`, `formatTime`, `guessMapping`, `applyMapping`, `stationKey`; types `ParsedTable`, `Reading`.
- `mapping.ts:mapColumns(table, llm): Promise<ColumnMapping | null>` - model mapping, else `guessMapping` with a warning.
- `analyze.ts:analyze(table, mapping, previous): Analysis`.
- `compare.ts:compareBriefs(prev, curr)` and `compare.ts:buildChangeFindings(c, existing, rows)`.
- `bands.ts`: `BANDS`, `BAND_SOURCE`, `bandForPm25`, `bandRank`, `GUIDANCE`, `fixedAdvisory`, `AUDIENCE_LABEL`, `AUDIENCE_LEVERS`; type `Band`.
- `llm.ts:chatJson({ llm, purpose, system, user, schema, timeoutMs, maxTokens })` - validated JSON from OpenRouter; `llm.ts:LlmConfig` is `{ apiKey, model, baseUrl }`.
- `pipeline.ts:UserError` - a problem the user can fix, with `statusCode` 404 or 422.
- `write.ts:writeBrief(brief, llm): Promise<{ written, error }>` and `write.ts:checkText(text, ctx, allowFindings)`.
- `samples.ts:SAMPLES` (ids `"A"` to `"E"`; A to D are consecutive three-day periods in Nov 2026, E is a month of daily averages) and type `Sample` (`label`, `period`, `description`, `text`).
- `types.ts`: `AUDIENCES` (`ward_officer`, `housing_society`, `school`), `Audience`, `BandKey`, `Brief`, `Written`, `Finding`, `StationStat`, `Comparison`, and related types. The file header says it is shared with `apps/web` via `import type`, so it must stay free of Node-only imports.

## Invariants

- `pipeline.ts:MAX_ROWS` is 3000; more rows, zero data rows, or no PM2.5 column throw `UserError` with `statusCode` 422. An unknown brief id in `writeForBrief` throws `UserError` with 404.
- `table.ts:Reading.pm25`/`pm10` are in µg/m3: `applyMapping` converts mg/m3 (`* 1_000_000 / 1000`), and excludes values with an unsupported unit (flagged `suspect`).
- `analyze.ts:markSuspect` nulls out and flags negative values, PM2.5 above `SUSPECT_PM25_MAX` (1000), PM2.5 greater than PM10, and runs of at least `STUCK_RUN` (4) identical values per station.
- `analyze.ts`: a station `qualifies` only with at least `MIN_READINGS` (3) valid PM2.5 readings; a hotspot is named only when at least 2 stations qualify; the band uses the highest qualifying station mean, else the overall mean when at least 3 valid readings exist, else `unknown`.
- `analyze.ts`/`compare.ts`: findings get sequential ids `F1..Fn`; change findings continue the numbering and carry `prevBriefId`. Their `display` text is built by code.
- `compare.ts:CHANGE_THRESHOLD` is 0.1 (10%) for `higher`/`lower`; the compared brief is `store.latest()` regardless of audience (`pipeline.ts:createBrief`).
- `write.ts:checkText` accepts text only when every number comes from a placeholder (`{BAND}` or `{Fn}` with `Fn` in the brief's findings); `{Fn}` is not allowed at `simple` advisory level (`checkVariant`); station names and PM labels are exempt from the digit check.
- `write.ts:checkVariant`: English must contain no Devanagari, Hindi must contain it, headline must contain `{BAND}`; a Hindi variant is replaced by fixed text if its placeholder set differs from English.
- `write.ts:writeBrief`: `Written.status` is `"model"` only when no warnings were produced; fewer than 2 valid actions switches to `templateActions`; at most 6 actions kept; `what_changed` is `NO_PREVIOUS` when `brief.comparison` is null.
- `write.ts:writeBrief` never throws for model failures; they return `fallbackWritten` plus an error string.
- `llm.ts:chatJson` makes at most 2 attempts, retrying only retryable `LlmError`s (malformed/empty/truncated reply, schema mismatch, HTTP 5xx); timeouts and network errors are not retried. The reply is streamed (`stream: true`, server-sent events), so `timeoutMs` is the longest allowed silence, reset by every chunk including OpenRouter's keep-alive comments; one call is capped at 4 × `timeoutMs`. A plain JSON reply (a provider that ignores `stream`, or the test stub) is also accepted. Requests ask for low, hidden reasoning (`reasoning: { effort: "low", exclude: true }`). A missing API key fails at once without a network call. Temperature is 0.2.
- `bands.ts:bandForPm25` thresholds: 30, 60, 90, 120, 250 on the rounded mean.

## Side Effects

- `llm.ts:callOnce`: HTTPS POST to `${llm.baseUrl}/chat/completions` using `llm.apiKey` and `llm.model`. This directory reads no environment; the config is passed in from `../services.ts`.
- `llm.ts:log`: writes a JSON `llm_call` line to stdout via `console.info` per attempt.
- `pipeline.ts:createBrief` calls `store.latest()` and `store.insert()`; `writeForBrief` calls `store.get()` and `store.update()` (D1 writes via `../store`).
- All other modules (`table.ts`, `analyze.ts`, `compare.ts`, `bands.ts`, `types.ts`) are pure functions/data; `analyze.ts` mutates the `Reading` objects it receives (`markSuspect`).

## Verification

- Run: `pnpm --filter server test` (tests in `brief.test.ts`; the store runs on an in-memory `node:sqlite` database behind the D1 calls it makes)
- Run: `pnpm --filter server check-types`
