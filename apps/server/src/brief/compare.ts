import { BANDS, bandRank } from "./bands";
import type {
  BandKey,
  Brief,
  Comparison,
  Coverage,
  Finding,
  StationChange,
  StationStat,
} from "./types";

const CHANGE_THRESHOLD = 0.1;
const ug = (n: number) => `${Math.round(n)} µg/m³`;

function status(prev: number, curr: number): "higher" | "lower" | "about the same" {
  if (prev === 0) return curr > 0 ? "higher" : "about the same";
  const c = (curr - prev) / prev;
  return c > CHANGE_THRESHOLD ? "higher" : c < -CHANGE_THRESHOLD ? "lower" : "about the same";
}

interface CurrentStats {
  overallMean: number | null;
  band: BandKey;
  hotspotName: string | null;
  stations: StationStat[];
  coverage: Coverage;
  qualifyingCount: number;
}

/** The previous brief is the latest saved one, whatever audience it was written for. */
export function compareBriefs(prev: Brief | null, curr: CurrentStats): Comparison | null {
  if (!prev) return null;

  const prevHotspot =
    prev.stations.filter((s) => s.qualifies).length >= 2
      ? (prev.stations.find((s) => s.qualifies)?.name ?? null)
      : null;

  const prevByKey = new Map(prev.stations.map((s) => [s.key, s]));
  const currByKey = new Map(curr.stations.map((s) => [s.key, s]));
  const stations: StationChange[] = [];
  for (const s of curr.stations) {
    const p = prevByKey.get(s.key);
    stations.push({
      station: s.name,
      prevMean: p?.mean ?? null,
      currMean: s.mean,
      status: !p
        ? "new station"
        : !p.qualifies || !s.qualifies || p.mean === null || s.mean === null
          ? "too few readings"
          : status(p.mean, s.mean),
    });
  }
  for (const p of prev.stations) {
    if (!currByKey.has(p.key)) {
      stations.push({
        station: p.name,
        prevMean: p.mean,
        currMean: null,
        status: "not in this brief",
      });
    }
  }

  const pm = prev.overall.mean;
  const cm = curr.overallMean;
  const overall =
    pm === null && cm === null
      ? null
      : {
          prev: pm,
          curr: cm,
          pct: pm !== null && cm !== null && pm !== 0 ? Math.round(((cm - pm) / pm) * 100) : null,
          status: pm !== null && cm !== null ? status(pm, cm) : "cannot be compared",
        };

  const dropped = prevHotspot
    ? stations.find((s) => s.station === prevHotspot && s.status === "too few readings")
    : undefined;

  return {
    previousId: prev.id,
    previousLabel: prev.label,
    previousPeriod: prev.period,
    overall,
    band: { prev: prev.band, curr: curr.band, changed: prev.band !== curr.band },
    hotspot: {
      prev: prevHotspot,
      curr: curr.hotspotName,
      changed: prevHotspot !== curr.hotspotName,
      note: dropped
        ? `${prevHotspot} now has too few valid readings to be ranked, so this is not a like-for-like comparison`
        : undefined,
    },
    coverage: {
      prevGapRows: prev.coverage.gapRows,
      currGapRows: curr.coverage.gapRows,
      prevSuspectRows: prev.coverage.suspectRows,
      currSuspectRows: curr.coverage.suspectRows,
    },
    stations,
  };
}

/** Findings that let the written text cite what changed, with the earlier brief named as the source. */
export function buildChangeFindings(
  c: Comparison,
  existing: number,
  rows: { hotspotRows: number[]; allRows: number[] },
): Finding[] {
  const out: Finding[] = [];
  const add = (kind: string, label: string, display: string, rowIds: number[]) => {
    out.push({
      id: `F${existing + out.length + 1}`,
      kind,
      label,
      display,
      rowIds,
      prevBriefId: c.previousId,
    });
  };

  if (c.overall && c.overall.prev !== null && c.overall.curr !== null) {
    add(
      "change_overall",
      `Change in mean PM2.5 since brief #${c.previousId}`,
      `${c.overall.status === "about the same" ? "about the same as" : `${c.overall.status} than`} brief #${c.previousId} (${ug(c.overall.prev)} before, ${ug(c.overall.curr)} now${c.overall.pct === null ? "" : `, ${c.overall.pct > 0 ? "+" : ""}${c.overall.pct}%`})`,
      rows.allRows,
    );
  } else {
    add(
      "change_overall",
      "Change in mean PM2.5",
      `cannot be compared with brief #${c.previousId}: one of the two briefs has no valid mean`,
      [],
    );
  }

  add(
    "change_band",
    `Change in air quality band since brief #${c.previousId}`,
    c.band.changed
      ? `moved from ${BANDS[c.band.prev].en} to ${BANDS[c.band.curr].en}${bandRank(c.band.curr) > bandRank(c.band.prev) && bandRank(c.band.prev) >= 0 ? " (worse)" : bandRank(c.band.curr) >= 0 && bandRank(c.band.curr) < bandRank(c.band.prev) ? " (better)" : ""}`
      : `unchanged at ${BANDS[c.band.curr].en}`,
    rows.allRows,
  );

  add(
    "change_hotspot",
    `Change in hotspot station since brief #${c.previousId}`,
    c.hotspot.curr === null && c.hotspot.prev === null
      ? "no hotspot could be named in either brief"
      : c.hotspot.changed
        ? `moved from ${c.hotspot.prev ?? "no named hotspot"} to ${c.hotspot.curr ?? "no named hotspot"}${c.hotspot.note ? ` (${c.hotspot.note})` : ""}`
        : `unchanged: ${c.hotspot.curr}`,
    rows.hotspotRows,
  );

  const newOrGone = c.stations.filter(
    (s) => s.status === "new station" || s.status === "not in this brief",
  );
  if (newOrGone.length) {
    add(
      "change_stations",
      "Stations that appear in only one of the two briefs",
      newOrGone.map((s) => `${s.station} (${s.status})`).join("; "),
      [],
    );
  }

  add(
    "change_quality",
    "Change in data quality",
    `rows with gaps: ${c.coverage.prevGapRows} before, ${c.coverage.currGapRows} now; rows with unreliable readings: ${c.coverage.prevSuspectRows} before, ${c.coverage.currSuspectRows} now`,
    [],
  );
  return out;
}
