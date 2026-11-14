import { z } from "zod";

import { chatJson } from "./llm";
import { type ParsedTable, guessMapping } from "./table";
import type { ColumnMapping } from "./types";

const Unit = z.enum(["ug/m3", "mg/m3", "unspecified", "other"]);
const Index = z.number().int().min(0).nullable();

const MappingReply = z.object({
  station: Index,
  timestamp: Index,
  pm25: Index,
  pm10: Index,
  pm25_unit: Unit,
  pm10_unit: Unit,
  notes: z.string().max(300).optional(),
});

const SYSTEM = `You map the columns of a messy air quality table onto a fixed schema.
You only identify columns and units. You never copy, clean, convert or compute any reading.
Reply with one JSON object and nothing else.`;

function userPrompt(table: ParsedTable): string {
  const head = table.headers.map((h, i) => `${i}: ${h}`).join("\n");
  const sample = table.rows
    .slice(0, 6)
    .map((r) => JSON.stringify(r))
    .join("\n");
  return `Columns (0-based index: header):
${head}

First rows:
${sample}

Return JSON of exactly this shape:
{
  "station": <column index of the monitoring station or site name, or null>,
  "timestamp": <column index of the date and time, or null>,
  "pm25": <column index of PM2.5, or null>,
  "pm10": <column index of PM10, or null>,
  "pm25_unit": "ug/m3" | "mg/m3" | "unspecified" | "other",
  "pm10_unit": "ug/m3" | "mg/m3" | "unspecified" | "other",
  "notes": <optional, one short sentence on anything odd, such as mixed date formats>
}
Use "unspecified" when no unit is stated in the header, and "other" for any unit that is not ug/m3 or mg/m3.
Use null for a column the table does not have. Do not map the same column twice. Do not map a remarks or notes column.`;
}

function valid(m: z.infer<typeof MappingReply>, width: number): string | null {
  const cols = [m.station, m.timestamp, m.pm25, m.pm10];
  if (cols.some((c) => c !== null && c >= width)) return "a column index was outside the table";
  const used = cols.filter((c): c is number => c !== null);
  if (new Set(used).size !== used.length) return "the same column was mapped twice";
  if (m.pm25 === null) return "no PM2.5 column was identified";
  return null;
}

export async function mapColumns(table: ParsedTable): Promise<ColumnMapping | null> {
  let warning: string;
  try {
    const m = await chatJson({
      purpose: "mapping",
      system: SYSTEM,
      user: userPrompt(table),
      schema: MappingReply,
      timeoutMs: 30_000,
      maxTokens: 400,
    });
    const problem = valid(m, table.headers.length);
    if (!problem) {
      return {
        source: "model",
        station: m.station,
        timestamp: m.timestamp,
        pm25: m.pm25,
        pm10: m.pm10,
        pm25Unit: m.pm25_unit,
        pm10Unit: m.pm10_unit,
        notes: m.notes,
      };
    }
    warning = `The model's column mapping was rejected (${problem}), so header matching was used instead.`;
  } catch (e) {
    warning = `The model could not map the columns (${(e as Error).message}), so header matching was used instead.`;
  }
  return guessMapping(table.headers, warning);
}
