# Vayu: Civic Air Quality Briefing Studio

- **Author:** Piyush Jain
- **Date:** 2026-11-14

## Overview

A single-page tool for ward officers, housing societies, and schools. The user
pastes a messy air quality table, picks who they are, and gets a brief: what the
data shows, which station is worst, which readings are missing or unreliable,
what to do about it given their role, and what changed since the last brief. The
brief includes an internal briefing note and a citizen advisory in English and
Hindi at two reading levels (simple and standard), with specific guidance for
children, older adults, and people sensitive to poor air.

The LLM (through OpenRouter) does two jobs only: it works out which messy column
means what, and it writes the prose. Plain code computes every number. This is a
hackathon build with a 30-minute deadline, one local user, and no deployment.

## Analysis

Seven review lenses examined the concept against the repository. Their findings,
deduplicated:

**1. The OpenRouter setup is incomplete.** `apps/server/.env` now has
`OPENROUTER_API_KEY` (added after the review started; the reviewers saw the file
without it), but it has no `OPENROUTER_MODEL`, and `apps/server/.env.schema`
declares neither variable. The schema marks every variable as required, so a
declared but empty key stops the server at startup. Both variables must be
declared in the schema, `OPENROUTER_MODEL` needs a value (in `.env` or as a
schema default), and `pnpm env:generate` must run afterwards.

**2. The Prisma setup has never run.** The Prisma client was never generated,
`packages/db/src/index.ts` imports a folder that does not exist yet, and there
is no database file. Getting Prisma working costs setup time with no visible
benefit in a demo. The server already depends on `libsql`, which can open a
SQLite file and run one `CREATE TABLE IF NOT EXISTS briefs` statement. Two
lenses preferred a single Prisma model; the two lenses that inspected the wiring
recommended skipping Prisma. The existing `DATABASE_URL` is a `file:` URL with a
relative path; the build must strip the `file:` prefix and resolve the path
before handing it to `libsql`, and that has not been run yet.

**3. The model could invent numbers or row references.** If the model computes
or restates figures, no reader can verify them without redoing the work. The
resolution is a strict split:

- Call 1 returns only a mapping: which input column is the station, the
  timestamp, PM2.5, PM10, and what unit each uses.
- Code parses the rows with that mapping and computes findings, each shaped as
  `{id, value, rowIds}`.
- Call 2 writes prose that refers to findings by placeholder, for example
  `{F3}`. Code replaces each placeholder with the value and a link to its source
  rows. Code rejects any digit (Latin or Devanagari) that appears outside a
  placeholder, and drops references to finding ids that do not exist.
- The column mapping is shown on screen, because a wrong mapping corrupts every
  number downstream without any error.

**4. Several terms had no definition.** The build uses these:

| Term            | Definition                                                                                                                                            |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gap             | A blank or unparseable cell or timestamp.                                                                                                             |
| Suspect reading | Negative, PM2.5 above 1000, PM2.5 above PM10, or the same value four times in a row. Excluded from statistics, with the reason shown.                 |
| Trend           | Mean of the second half of the period compared with the mean of the first half. A difference beyond 10% is "rising" or "falling"; otherwise "steady". |
| Hotspot         | The station with the highest mean PM2.5. This ranks stations; it does not locate a pollution source.                                                  |
| Previous brief  | The most recently saved brief, whatever audience it was for.                                                                                          |
| Units           | µg/m³. Values in mg/m³ are converted. Any other unit is flagged and excluded.                                                                         |

**5. The comparison shows nothing on a fresh demo.** With an empty database the
"what changed" section is blank. The build bundles two sample tables covering
the same Bhopal stations for two periods. Running the first then the second
produces a real comparison through the normal pipeline. The first run shows "No
earlier brief to compare." The comparison is computed in code from the stored
statistics of both briefs.

**6. Advisory safety without a human reviewer.** Nobody on the project can check
the Hindi text. The resolution limits what the model can get wrong:

- Code picks the severity band from the computed statistics.
- The health guidance for each band and each sensitive group (children, older
  adults, people with asthma or heart or lung conditions) comes from a fixed
  table in code.
- The model only rewords that guidance for reading level and language.
- Code checks that the Hindi text carries the same placeholders as the English
  text at the same reading level. If the check fails, the fixed English text is
  shown instead.
- This check proves the band and the numbers match. It does not prove the Hindi
  wording is sound, so every Hindi advisory keeps the label "machine-translated,
  review before publishing".

**7. Demo resilience.** Statistics and flags render as soon as code finishes,
before the writing call returns. If the writing call times out (45 seconds) or
returns invalid JSON after one retry, the page shows a labelled fallback built
from code templates.

**Ideal final result.** Every number on screen comes from code and links to the
rows behind it; the model contributes only column interpretation and wording;
and a failure in either model call still leaves the user with verified
statistics and flags.

**Secondary trade-offs accepted.** The simple reading level carries no numbers,
so placeholder checks compare languages at the same level and not across levels.
"Hotspot" is a station ranking, which is weaker than the word suggests. The
bundled sample uses real Bhopal CPCB station names with invented readings and is
labelled as sample data.

## Goals vs. Non-Goals

- **In-Scope Goals:**
  - One `POST /briefs` route and one page.
  - Paste input, with "Load sample" buttons for two bundled Bhopal tables.
  - Audience picker: ward officer, housing society, school.
  - Exactly two LLM calls through OpenRouter using plain `fetch`, validated with
    zod, one retry, 45-second timeout.
  - Code-computed statistics, gaps, suspect readings, trend, hotspot, and
    severity band.
  - Ranked action list suited to the audience.
  - Internal briefing note.
  - Citizen advisory in English and Hindi, simple and standard levels, with
    guidance for children, older adults, and sensitive people.
  - Every finding linked to its source rows; column mapping shown on screen.
  - Briefs stored as one JSON document each in SQLite; comparison with the
    previous brief computed in code.
- **Out-of-Scope Non-Goals:**
  - Authentication, multiple tenants, deployment.
  - File upload (no multipart plugin is installed), streaming responses.
  - Charts, a history list, editing of generated text.
  - AQI sub-index calculation, pollutants other than PM2.5 and PM10.
  - Languages other than English and Hindi.
  - Fetching live data from CPCB or data.gov.in.
  - Using the chat components in `packages/ui`.

## Alternatives Weighed

- **The model returns cleaned rows or computes statistics.** Rejected by author:
  values would pass through the model, so they could not be traced to source
  rows, and token use would grow with row count.
- **One LLM call for everything.** Rejected by author: the column mapping must
  exist before code can compute the statistics that the prose refers to.
- **One LLM call per advisory variant (four calls).** Rejected by author: four
  times the latency and four times the points of failure.
- **Prisma with normalised tables.** Rejected by author: the Prisma client has
  never been generated in this repo, and the setup time brings no demo benefit
  over one JSON column in a `libsql` table.
- **Back-translation or a second model to judge the Hindi.** Rejected by author:
  it adds a slow call, and the judge is as unverifiable as the text it judges.
- **Seeding a fake previous brief.** Rejected by author: it bypasses the
  pipeline, so the comparison would prove nothing. Two real sample runs replace
  it.
- **Chat-style layout, or four advisory columns side by side.** Rejected by
  author: sections could not be scanned; toggles for language and level replace
  them.
- **Multipart file upload and streamed output.** Rejected by author: wiring cost
  inside a 30-minute build.
- **Downloading real CPCB data for the demo.** Rejected by author: the sources
  need an API key or a manual export, which the deadline does not allow.

## Key Decisions & Staging for Next Steps

1. Storage is `libsql` with one `briefs` table holding the whole brief as JSON.
   Prisma is left untouched. First build step: confirm the path from the
   existing `DATABASE_URL` opens in `libsql`; if not, use a fixed local file
   path.
2. Declare `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in
   `apps/server/.env.schema`, give `OPENROUTER_MODEL` a value, then run
   `pnpm env:generate`. The key itself is already in `apps/server/.env`.
3. Pipeline order: mapping call, code parsing and statistics, save and compare,
   writing call, placeholder substitution and digit check, render.
4. Definitions in the table above are fixed for this build.
5. Severity bands and per-group health guidance live in a code table. The source
   for the band thresholds must be stated in the UI.
6. UI controls are built from the existing Button, Card, and Textarea
   components, since no select or tabs components are installed.
7. Hindi advisories always carry the "machine-translated, review before
   publishing" label.
