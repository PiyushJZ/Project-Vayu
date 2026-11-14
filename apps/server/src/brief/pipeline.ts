import type { Services } from "../services";
import { analyze } from "./analyze";
import { mapColumns } from "./mapping";
import { SAMPLES } from "./samples";
import { parseTable } from "./table";
import type { Audience, Brief } from "./types";
import { writeBrief } from "./write";

const MAX_ROWS = 3000;

/** A problem with the request that the user can fix. `index.ts` turns statusCode into the HTTP status. */
export class UserError extends Error {
  readonly statusCode: 404 | 422;
  constructor(message: string, statusCode: 404 | 422 = 422) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Parse, map columns, compute everything in code, compare with the latest brief, and save. No writing step yet. */
export async function createBrief(
  { store, llm }: Services,
  input: { text: string; audience: Audience },
  map: typeof mapColumns = mapColumns,
): Promise<Brief> {
  const table = parseTable(input.text);
  if (table.rows.length === 0) throw new UserError("The table has a header row but no data rows.");
  if (table.rows.length > MAX_ROWS)
    throw new UserError(`The table has more than ${MAX_ROWS} rows. Paste a shorter period.`);

  const mapping = await map(table, llm);
  if (!mapping) {
    throw new UserError(
      `Could not find a PM2.5 column. The columns found were: ${table.headers.join(", ")}. Add a column whose header contains "PM2.5".`,
    );
  }

  const previous = await store.latest();
  const a = analyze(table, mapping, previous);
  const sample = SAMPLES.find((s) => s.text === input.text.trim());
  const now = new Date();

  const rows: Record<number, string[]> = {};
  table.rows.forEach((r, i) => (rows[i + 1] = r));

  return store.insert({
    createdAt: now.toISOString(),
    audience: input.audience,
    label: sample
      ? sample.label
      : pastedLabel(
          a.stations.map((s) => s.name),
          a.days,
        ),
    sample: sample?.id ?? null,
    status: "stats",
    mapping,
    table: { headers: table.headers, rows },
    rowFlags: a.rowFlags,
    coverage: a.coverage,
    period: a.period,
    overall: a.overall,
    stations: a.stations,
    band: a.band,
    bandBasis: a.bandBasis,
    findings: a.findings,
    comparison: a.comparison,
    written: null,
    writeError: null,
  });
}

/** Names the stations and the dates, the way a sample label does: "Idgah Hills and T T Nagar, 3 to 5 Nov 2026". */
function pastedLabel(stations: string[], days: string | null): string {
  const place =
    stations.length > 3
      ? `${stations.length} stations`
      : stations.length > 1
        ? `${stations.slice(0, -1).join(", ")} and ${stations.at(-1)}`
        : (stations[0] ?? "Pasted table");
  return days ? `${place}, ${days}` : place;
}

/** The second model call. Never throws for model problems: they become a labelled fallback. */
export async function writeForBrief({ store, llm }: Services, id: number): Promise<Brief> {
  const brief = await store.get(id);
  if (!brief) throw new UserError(`No brief with id ${id}.`, 404);
  const { written, error } = await writeBrief(brief, llm);
  const next: Brief = {
    ...brief,
    written,
    writeError: error,
    status: written.status === "model" ? "written" : "fallback",
  };
  await store.update(next);
  return next;
}
