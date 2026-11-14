import type { ColumnMapping, ColumnUnit, RowFlag } from "./types";

export interface ParsedTable {
  headers: string[];
  /** Data rows only. Row id n is rows[n - 1]. */
  rows: string[][];
}

const DELIMITERS = [",", "\t", ";", "|"] as const;

function countOutsideQuotes(line: string, d: string): number {
  let n = 0;
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === d && !inQ) n++;
  }
  return n;
}

function splitRecords(text: string, d: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += ch;
    } else if (ch === '"' && field === "") inQ = true;
    else if (ch === d) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      out.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  out.push(row);
  return out;
}

export function parseTable(input: string): ParsedTable {
  const text = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim();
  const firstLine = text.split("\n").find((l) => l.trim() !== "") ?? "";

  let best: string | null = null;
  let bestCount = 0;
  for (const d of DELIMITERS) {
    const c = countOutsideQuotes(firstLine, d);
    if (c > bestCount) {
      best = d;
      bestCount = c;
    }
  }

  let records: string[][];
  if (best) {
    records = splitRecords(text, best);
    if (best === "|") {
      records = records
        .map((r) => (r[0]?.trim() === "" ? r.slice(1) : r))
        .map((r) => (r.length && r[r.length - 1]?.trim() === "" ? r.slice(0, -1) : r))
        .filter((r) => !r.every((c) => /^\s*:?-{2,}:?\s*$/.test(c)));
    }
  } else {
    // Columns separated by runs of spaces, as pasted from a PDF or a terminal.
    records = text.split("\n").map((l) => l.trim().split(/\s{2,}/));
  }

  const cleaned = records.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
  const headers = cleaned[0] ?? [];
  const width = Math.max(headers.length, ...cleaned.map((r) => r.length));
  const pad = (r: string[]) => Array.from({ length: width }, (_, i) => r[i] ?? "");
  return {
    headers: pad(headers).map((h, i) => (h === "" ? `column ${i + 1}` : h)),
    rows: cleaned.slice(1).map(pad),
  };
}

const GAP_TOKENS = new Set([
  "",
  "na",
  "n/a",
  "nan",
  "null",
  "none",
  "-",
  "--",
  "---",
  "—",
  "–",
  "nd",
  "bdl",
  "missing",
  "?",
  "no data",
  "nodata",
  "ni",
]);

type CellNumber =
  | { ok: true; value: number; unit: "ug" | "mg" | null }
  | { ok: false; reason: string };

export function parseNumber(cell: string): CellNumber {
  const raw = cell.trim();
  if (GAP_TOKENS.has(raw.toLowerCase())) return { ok: false, reason: "missing" };

  const m = raw.match(/^([<>~≈]?)\s*(-?\d[\d,]*(?:\.\d+)?|-?\d+,\d+)\s*(.*)$/);
  if (!m) return { ok: false, reason: `unreadable value "${raw.slice(0, 20)}"` };
  if (m[1] === "<" || m[1] === ">")
    return { ok: false, reason: `censored value "${raw.slice(0, 20)}"` };

  let numText = m[2]!;
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(numText)) numText = numText.replace(/,/g, "");
  else if (/^-?\d+,\d+$/.test(numText)) numText = numText.replace(",", ".");
  const value = Number(numText);
  if (!Number.isFinite(value))
    return { ok: false, reason: `unreadable value "${raw.slice(0, 20)}"` };

  const rest = m[3]!
    .trim()
    .toLowerCase()
    .replace(/³/g, "3")
    .replace(/[µμ]/g, "u");
  if (rest === "" || /^[*#†]+$/.test(rest)) return { ok: true, value, unit: null };
  if (/^mg\s*\/\s*m3?$/.test(rest)) return { ok: true, value, unit: "mg" };
  if (/^ug\s*\/\s*m3?$/.test(rest)) return { ok: true, value, unit: "ug" };
  return { ok: false, reason: `unreadable value "${raw.slice(0, 20)}"` };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function buildTime(
  y: number,
  mo: number,
  d: number,
  hh?: string,
  mm?: string,
  ss?: string,
  ampm?: string,
): number | null {
  let h = hh === undefined ? 0 : Number(hh);
  const mi = mm === undefined ? 0 : Number(mm);
  const s = ss === undefined ? 0 : Number(ss);
  if (ampm) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (ampm.toLowerCase() === "pm" ? 12 : 0);
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 24 || mi > 59 || s > 59) return null;
  if (h === 24 && (mi !== 0 || s !== 0)) return null;
  const t = Date.UTC(y, mo - 1, d, h, mi, s);
  const back = new Date(t);
  // Reject dates that rolled over, such as 31 February.
  if (h < 24 && (back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d)) return null;
  return t;
}

const TIME = String.raw`(?:[,\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?)?`;

/** Parses to milliseconds, reading clock times as if they were UTC (no time zone is assumed). Day comes first in numeric dates. */
export function parseTimestamp(cell: string): number | null {
  const s = cell
    .trim()
    .replace(/\s+(IST|UTC|GMT)$/i, "")
    .replace(/Z$/, "");
  if (s === "") return null;

  let m = s.match(new RegExp(String.raw`^(\d{4})-(\d{1,2})-(\d{1,2})` + TIME + "$"));
  if (m) return buildTime(+m[1]!, +m[2]!, +m[3]!, m[4], m[5], m[6], m[7]);

  m = s.match(new RegExp(String.raw`^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})` + TIME + "$"));
  if (m) {
    let a = +m[1]!;
    let b = +m[2]!;
    if (b > 12 && a <= 12) [a, b] = [b, a]; // month-first input
    const y = +m[3]! < 100 ? 2000 + +m[3]! : +m[3]!;
    return buildTime(y, b, a, m[4], m[5], m[6], m[7]);
  }

  m = s.match(
    new RegExp(String.raw`^(\d{1,2})[\s\-\/]([A-Za-z]{3,9})\.?[\s\-\/,]+(\d{2,4})` + TIME + "$"),
  );
  if (m) {
    const mo = MONTHS.indexOf(m[2]!.slice(0, 3).toLowerCase()) + 1;
    if (mo === 0) return null;
    const y = +m[3]! < 100 ? 2000 + +m[3]! : +m[3]!;
    return buildTime(y, mo, +m[1]!, m[4], m[5], m[6], m[7]);
  }

  m = s.match(new RegExp(String.raw`^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})` + TIME + "$"));
  if (m) {
    const mo = MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase()) + 1;
    if (mo === 0) return null;
    return buildTime(+m[3]!, mo, +m[2]!, m[4], m[5], m[6], m[7]);
  }
  return null;
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]![0]!.toUpperCase()}${MONTHS[d.getUTCMonth()]!.slice(1)} ${d.getUTCFullYear()}, ${hh}:${mm}`;
}

function unitFromHeader(header: string): ColumnUnit {
  const h = header
    .toLowerCase()
    .replace(/³/g, "3")
    .replace(/[µμ]/g, "u");
  if (/mg\s*\/\s*m/.test(h)) return "mg/m3";
  if (/ug\s*\/\s*m/.test(h)) return "ug/m3";
  if (/ppm|ppb/.test(h)) return "other";
  return "unspecified";
}

function findColumn(headers: string[], tests: RegExp[], exclude: Set<number>): number | null {
  for (const t of tests) {
    const i = headers.findIndex((h, idx) => !exclude.has(idx) && t.test(h));
    if (i >= 0) return i;
  }
  return null;
}

/** Fallback when the model mapping fails: match header words. */
export function guessMapping(headers: string[], warning: string): ColumnMapping | null {
  const used = new Set<number>();
  const take = (i: number | null) => {
    if (i !== null) used.add(i);
    return i;
  };
  const pm25 = take(
    findColumn(headers, [/pm\s*[-_.]?\s*2\s*[._]?\s*5/i, /pm\s*2/i, /fine/i], used),
  );
  const pm10 = take(findColumn(headers, [/pm\s*[-_.]?\s*10/i, /coarse/i], used));
  const timestamp = take(
    findColumn(headers, [/date\s*\/?\s*time/i, /timestamp/i, /time/i, /date/i], used),
  );
  const station = take(
    findColumn(headers, [/station/i, /site/i, /location/i, /monitor/i, /area/i, /name/i], used),
  );
  if (pm25 === null) return null;
  return {
    source: "heuristic",
    station,
    timestamp,
    pm25,
    pm10,
    pm25Unit: unitFromHeader(headers[pm25]!),
    pm10Unit: pm10 === null ? "unspecified" : unitFromHeader(headers[pm10]!),
    warning,
  };
}

export interface Reading {
  rowId: number;
  station: string;
  stationKey: string;
  ts: number | null;
  /** Always in µg/m³ after conversion. Null when missing or excluded. */
  pm25: number | null;
  pm10: number | null;
  flags: RowFlag[];
}

function cleanStationName(raw: string): string {
  const name = raw.split(",")[0]!.replace(/\s+/g, " ").trim();
  return name === "" ? "Unspecified station" : name;
}

export function stationKey(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") || "unspecified";
}

export function applyMapping(table: ParsedTable, mapping: ColumnMapping): Reading[] {
  const readings: Reading[] = table.rows.map((cells, i) => {
    const flags: RowFlag[] = [];
    const rawStation = mapping.station === null ? "" : (cells[mapping.station] ?? "");
    if (mapping.station !== null && rawStation.trim() === "") {
      flags.push({ kind: "gap", field: "station", reason: "station name missing" });
    }
    const station = cleanStationName(rawStation);

    let ts: number | null = null;
    if (mapping.timestamp !== null) {
      const raw = cells[mapping.timestamp] ?? "";
      ts = parseTimestamp(raw);
      if (ts === null) {
        flags.push({
          kind: "gap",
          field: "timestamp",
          reason:
            raw.trim() === ""
              ? "timestamp missing"
              : `timestamp not understood: "${raw.slice(0, 24)}"`,
        });
      }
    }

    const value = (col: number | null, unit: ColumnUnit, field: "pm25" | "pm10"): number | null => {
      if (col === null) return null;
      const parsed = parseNumber(cells[col] ?? "");
      if (!parsed.ok) {
        flags.push({ kind: "gap", field, reason: parsed.reason });
        return null;
      }
      const effective =
        parsed.unit ?? (unit === "mg/m3" ? "mg" : unit === "other" ? "other" : "ug");
      if (effective === "other") {
        flags.push({
          kind: "suspect",
          field,
          reason: "unit is not µg/m³ or mg/m³, so the value was excluded",
        });
        return null;
      }
      return effective === "mg" ? Math.round(parsed.value * 1_000_000) / 1000 : parsed.value;
    };

    return {
      rowId: i + 1,
      station,
      stationKey: stationKey(station),
      ts,
      pm25: value(mapping.pm25, mapping.pm25Unit, "pm25"),
      pm10: value(mapping.pm10, mapping.pm10Unit, "pm10"),
      flags,
    };
  });
  return readings;
}
