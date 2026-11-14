import { BANDS, BAND_SOURCE, bandForPm25 } from "./bands";
import { buildChangeFindings, compareBriefs } from "./compare";
import { type ParsedTable, type Reading, applyMapping, formatTime } from "./table";
import type {
  Brief,
  ColumnMapping,
  Comparison,
  Coverage,
  Finding,
  RowFlag,
  StationStat,
} from "./types";

const MIN_READINGS = 3;
const STUCK_RUN = 4;
const TREND_THRESHOLD = 0.1;
const SUSPECT_PM25_MAX = 1000;

type Trend = StationStat["trend"];

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const r1 = (n: number) => Math.round(n * 10) / 10;
const ug = (n: number) => `${Math.round(n)} µg/m³`;

function flag(r: Reading, f: RowFlag) {
  r.flags.push(f);
}

/** Excludes values that cannot be real, and says why. */
function markSuspect(readings: Reading[]) {
  for (const r of readings) {
    if (r.pm25 !== null && r.pm25 < 0) {
      flag(r, { kind: "suspect", field: "pm25", reason: "negative PM2.5" });
      r.pm25 = null;
    }
    if (r.pm10 !== null && r.pm10 < 0) {
      flag(r, { kind: "suspect", field: "pm10", reason: "negative PM10" });
      r.pm10 = null;
    }
    if (r.pm25 !== null && r.pm25 > SUSPECT_PM25_MAX) {
      flag(r, { kind: "suspect", field: "pm25", reason: `PM2.5 above ${SUSPECT_PM25_MAX} µg/m³` });
      r.pm25 = null;
    }
    if (r.pm25 !== null && r.pm10 !== null && r.pm25 > r.pm10) {
      const reason = "PM2.5 higher than PM10, which cannot be right; both values excluded";
      flag(r, { kind: "suspect", field: "pm25", reason });
      flag(r, { kind: "suspect", field: "pm10", reason });
      r.pm25 = null;
      r.pm10 = null;
    }
  }

  // Stuck sensor: the same value four or more times in a row for one station, in time order.
  const byStation = new Map<string, Reading[]>();
  for (const r of readings) {
    if (r.ts === null) continue;
    byStation.set(r.stationKey, [...(byStation.get(r.stationKey) ?? []), r]);
  }
  for (const list of byStation.values()) {
    list.sort((a, b) => a.ts! - b.ts! || a.rowId - b.rowId);
    for (const field of ["pm25", "pm10"] as const) {
      let run: Reading[] = [];
      const close = () => {
        if (run.length >= STUCK_RUN) {
          for (const r of run) {
            flag(r, {
              kind: "suspect",
              field,
              reason: `same ${field === "pm25" ? "PM2.5" : "PM10"} value ${run.length} times in a row (possible stuck sensor)`,
            });
            r[field] = null;
          }
        }
        run = [];
      };
      for (const r of list) {
        const v = r[field];
        if (v === null) close();
        else if (run.length && run[0]![field] !== v) {
          close();
          run.push(r);
        } else run.push(r);
      }
      close();
    }
  }
}

function trendOf(points: { ts: number; v: number }[]): {
  trend: Trend;
  first: number | null;
  second: number | null;
  pct: number | null;
} {
  const none = { trend: "insufficient" as Trend, first: null, second: null, pct: null };
  if (points.length < 4) return none;
  const lo = Math.min(...points.map((p) => p.ts));
  const hi = Math.max(...points.map((p) => p.ts));
  if (lo === hi) return none;
  const mid = (lo + hi) / 2;
  const a = points.filter((p) => p.ts < mid).map((p) => p.v);
  const b = points.filter((p) => p.ts >= mid).map((p) => p.v);
  if (a.length < 2 || b.length < 2) return none;
  const first = mean(a);
  const second = mean(b);
  if (first === 0) return none;
  const change = (second - first) / first;
  const trend: Trend =
    change > TREND_THRESHOLD ? "rising" : change < -TREND_THRESHOLD ? "falling" : "steady";
  return { trend, first, second, pct: Math.round(change * 100) };
}

interface Analysis {
  rowFlags: Record<number, RowFlag[]>;
  coverage: Coverage;
  period: string;
  overall: { mean: number | null; validPm25: number };
  stations: StationStat[];
  band: Brief["band"];
  bandBasis: string;
  findings: Finding[];
  comparison: Comparison | null;
}

export function analyze(
  table: ParsedTable,
  mapping: ColumnMapping,
  previous: Brief | null,
): Analysis {
  const readings = applyMapping(table, mapping);
  markSuspect(readings);

  const rowFlags: Record<number, RowFlag[]> = {};
  for (const r of readings) if (r.flags.length) rowFlags[r.rowId] = r.flags;

  const gapRows = readings.filter((r) => r.flags.some((f) => f.kind === "gap"));
  const suspectRows = readings.filter((r) => r.flags.some((f) => f.kind === "suspect"));
  const valid = readings.filter((r) => r.pm25 !== null);

  // Station grouping. The display name is the most common cleaned spelling.
  const groups = new Map<string, Reading[]>();
  for (const r of readings) groups.set(r.stationKey, [...(groups.get(r.stationKey) ?? []), r]);

  const stations: StationStat[] = [...groups.entries()].map(([key, rs]) => {
    const spellings = new Map<string, number>();
    for (const r of rs) spellings.set(r.station, (spellings.get(r.station) ?? 0) + 1);
    const name = [...spellings.entries()].sort((a, b) => b[1] - a[1])[0]![0];
    const ok = rs.filter((r) => r.pm25 !== null);
    const vals = ok.map((r) => r.pm25!);
    const timed = ok.filter((r) => r.ts !== null).map((r) => ({ ts: r.ts!, v: r.pm25! }));
    return {
      key,
      name,
      rows: rs.length,
      validPm25: vals.length,
      mean: vals.length ? r1(mean(vals)) : null,
      min: vals.length ? Math.min(...vals) : null,
      max: vals.length ? Math.max(...vals) : null,
      gaps: rs.filter((r) => r.flags.some((f) => f.kind === "gap")).length,
      suspect: rs.filter((r) => r.flags.some((f) => f.kind === "suspect")).length,
      qualifies: vals.length >= MIN_READINGS,
      trend: trendOf(timed).trend,
      rowIds: ok.map((r) => r.rowId),
    };
  });
  stations.sort(
    (a, b) => Number(b.qualifies) - Number(a.qualifies) || (b.mean ?? -1) - (a.mean ?? -1),
  );

  const overallMean = valid.length ? r1(mean(valid.map((r) => r.pm25!))) : null;
  const qualifying = stations.filter((s) => s.qualifies);
  const hotspot = qualifying.length >= 2 ? qualifying[0]! : null;

  // Advisory band follows the worst qualifying station, so a hotspot is not averaged away.
  let bandStation: StationStat | null = null;
  for (const s of qualifying)
    if (!bandStation || (s.mean ?? 0) > (bandStation.mean ?? 0)) bandStation = s;
  const bandMean = bandStation
    ? bandStation.mean
    : valid.length >= MIN_READINGS
      ? overallMean
      : null;
  const band = bandForPm25(bandMean);
  const bandBasis = bandStation
    ? `${BAND_SOURCE}. The band uses the highest station mean (${bandStation.name}, ${ug(bandStation.mean!)}).`
    : bandMean !== null
      ? `${BAND_SOURCE}. The band uses the mean of all valid readings.`
      : `${BAND_SOURCE}. No band could be set because fewer than ${MIN_READINGS} valid PM2.5 readings exist.`;

  const times = readings.filter((r) => r.ts !== null).map((r) => r.ts!);
  const period = times.length
    ? `${formatTime(Math.min(...times))} to ${formatTime(Math.max(...times))}`
    : "period unknown (no readable timestamps)";

  const coverage: Coverage = {
    totalRows: readings.length,
    validPm25: valid.length,
    gapRows: gapRows.length,
    suspectRows: suspectRows.length,
  };

  const findings: Finding[] = [];
  const add = (kind: string, label: string, display: string, rowIds: number[]) => {
    findings.push({ id: `F${findings.length + 1}`, kind, label, display, rowIds });
  };

  add(
    "period",
    "Period covered",
    period,
    readings.filter((r) => r.ts !== null).map((r) => r.rowId),
  );
  add(
    "coverage",
    "Readings used",
    `${valid.length} of ${readings.length} rows had a usable PM2.5 reading`,
    valid.map((r) => r.rowId),
  );
  add(
    "overall_mean",
    "Mean PM2.5 over all valid readings",
    overallMean === null ? "no valid PM2.5 readings" : ug(overallMean),
    valid.map((r) => r.rowId),
  );
  add(
    "band",
    `Air quality band used for the advisory: ${BANDS[band].en}`,
    BANDS[band].range,
    bandStation ? bandStation.rowIds : valid.map((r) => r.rowId),
  );

  if (hotspot) {
    add(
      "hotspot",
      "Likely hotspot: station with the highest mean PM2.5",
      `${hotspot.name} (mean ${ug(hotspot.mean!)} over ${hotspot.validPm25} valid readings)`,
      hotspot.rowIds,
    );
  } else {
    add(
      "hotspot",
      "Likely hotspot",
      qualifying.length === 1
        ? "cannot be named: only one station has enough valid readings to compare"
        : `cannot be named: no station has at least ${MIN_READINGS} valid readings`,
      [],
    );
  }

  const peak = valid.reduce<Reading | null>(
    (m, r) => (m === null || r.pm25! > m.pm25! ? r : m),
    null,
  );
  if (peak) {
    add(
      "peak",
      "Highest single valid PM2.5 reading",
      `${ug(peak.pm25!)} at ${peak.station}${peak.ts !== null ? `, ${formatTime(peak.ts)}` : ""}`,
      [peak.rowId],
    );
  }

  const trendText = (name: string, t: ReturnType<typeof trendOf>, ids: number[], kind: string) => {
    if (t.trend === "insufficient") {
      add(kind, `Trend in ${name}`, "not enough timed readings to judge a trend", ids);
    } else {
      add(
        kind,
        `Trend in ${name}`,
        t.trend === "steady"
          ? `steady (${ug(t.first!)} in the first half, ${ug(t.second!)} in the second half)`
          : `${t.trend} (${ug(t.first!)} in the first half to ${ug(t.second!)} in the second half, ${t.pct! > 0 ? "+" : ""}${t.pct}%)`,
        ids,
      );
    }
  };
  const timedAll = valid.filter((r) => r.ts !== null);
  trendText(
    "mean PM2.5, all stations",
    trendOf(timedAll.map((r) => ({ ts: r.ts!, v: r.pm25! }))),
    timedAll.map((r) => r.rowId),
    "trend",
  );
  if (hotspot) {
    const t = valid.filter((r) => r.stationKey === hotspot.key && r.ts !== null);
    trendText(
      `the hotspot station (${hotspot.name})`,
      trendOf(t.map((r) => ({ ts: r.ts!, v: r.pm25! }))),
      t.map((r) => r.rowId),
      "hotspot_trend",
    );
  }

  for (const s of stations) {
    add(
      "station_mean",
      `Mean PM2.5 at ${s.name}`,
      s.mean === null
        ? "no valid PM2.5 readings"
        : `${ug(s.mean)} over ${s.validPm25} valid readings${s.qualifies ? "" : " (too few to rank)"}`,
      s.rowIds,
    );
  }

  const gapBy = (field: RowFlag["field"]) =>
    readings.filter((r) => r.flags.some((f) => f.kind === "gap" && f.field === field)).length;
  add(
    "gaps",
    "Data gaps",
    gapRows.length === 0
      ? "no gaps found"
      : `${gapRows.length} rows with gaps (PM2.5 ${gapBy("pm25")}, PM10 ${gapBy("pm10")}, timestamp ${gapBy("timestamp")}, station ${gapBy("station")})`,
    gapRows.map((r) => r.rowId),
  );
  add(
    "suspect",
    "Unreliable readings excluded",
    suspectRows.length === 0
      ? "none found"
      : `${suspectRows.length} rows had readings excluded as unreliable`,
    suspectRows.map((r) => r.rowId),
  );

  const unitNotes: string[] = [];
  if (mapping.pm25Unit === "mg/m3") unitNotes.push("PM2.5 given in mg/m³ was converted to µg/m³");
  if (mapping.pm25Unit === "unspecified")
    unitNotes.push("no PM2.5 unit was stated, so µg/m³ was assumed");
  if (mapping.pm25Unit === "other")
    unitNotes.push("PM2.5 unit is not supported, so PM2.5 values were excluded");
  if (unitNotes.length) add("units", "Unit handling", unitNotes.join("; "), []);

  const comparison = compareBriefs(previous, {
    overallMean,
    band,
    hotspotName: hotspot?.name ?? null,
    stations,
    coverage,
    qualifyingCount: qualifying.length,
  });
  if (comparison) {
    for (const f of buildChangeFindings(comparison, findings.length, {
      hotspotRows: hotspot?.rowIds ?? [],
      allRows: valid.map((r) => r.rowId),
    })) {
      findings.push(f);
    }
  }

  return {
    rowFlags,
    coverage,
    period,
    overall: { mean: overallMean, validPm25: valid.length },
    stations,
    band,
    bandBasis,
    findings,
    comparison,
  };
}
