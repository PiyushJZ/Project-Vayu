// Shared with apps/web via `import type`. Keep this file free of Node-only imports.

export const AUDIENCES = ["ward_officer", "housing_society", "school"] as const;
export type Audience = (typeof AUDIENCES)[number];

export type BandKey =
  | "good"
  | "satisfactory"
  | "moderate"
  | "poor"
  | "very_poor"
  | "severe"
  | "unknown";

export type ColumnUnit = "ug/m3" | "mg/m3" | "unspecified" | "other";

export interface ColumnMapping {
  source: "model" | "heuristic";
  /** 0-based column indexes, null when the table has no such column. */
  station: number | null;
  timestamp: number | null;
  pm25: number | null;
  pm10: number | null;
  pm25Unit: ColumnUnit;
  pm10Unit: ColumnUnit;
  notes?: string;
  /** Why the model mapping was not used, when source is "heuristic". */
  warning?: string;
}

export interface RowFlag {
  kind: "gap" | "suspect";
  field: "station" | "timestamp" | "pm25" | "pm10";
  reason: string;
}

export interface Finding {
  id: string;
  kind: string;
  label: string;
  /** Text that replaces a {Fn} placeholder. Always built by code. */
  display: string;
  rowIds: number[];
  /** Brief that a change finding compares against. */
  prevBriefId?: number;
}

export interface StationStat {
  key: string;
  name: string;
  rows: number;
  validPm25: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  gaps: number;
  suspect: number;
  /** At least 3 valid PM2.5 readings, so it may be ranked as a hotspot. */
  qualifies: boolean;
  trend: "rising" | "falling" | "steady" | "insufficient";
  rowIds: number[];
}

export interface Coverage {
  totalRows: number;
  validPm25: number;
  gapRows: number;
  suspectRows: number;
}

export interface StationChange {
  station: string;
  prevMean: number | null;
  currMean: number | null;
  status:
    | "higher"
    | "lower"
    | "about the same"
    | "new station"
    | "not in this brief"
    | "too few readings";
}

export interface Comparison {
  previousId: number;
  previousLabel: string;
  previousPeriod: string;
  overall: { prev: number | null; curr: number | null; pct: number | null; status: string } | null;
  band: { prev: BandKey; curr: BandKey; changed: boolean };
  hotspot: { prev: string | null; curr: string | null; changed: boolean; note?: string };
  coverage: {
    prevGapRows: number;
    currGapRows: number;
    prevSuspectRows: number;
    currSuspectRows: number;
  };
  stations: StationChange[];
}

export interface AdvisoryText {
  headline: string;
  general: string;
  children: string;
  older_adults: string;
  sensitive: string;
}

export interface AdvisoryVariant extends AdvisoryText {
  source: "model" | "fixed";
  warning?: string;
}

export interface Action {
  title: string;
  detail: string;
  who: string;
  timeframe: "today" | "this week" | "this month";
  findingIds: string[];
}

export interface NoteSection {
  text: string;
  source: "model" | "template";
}

export interface Written {
  /** "model" when the model's text passed every check; "fallback" when any part was replaced by code text. */
  status: "model" | "fallback";
  model: string;
  note: {
    headline: NoteSection;
    summary: NoteSection;
    hotspots_and_trend: NoteSection;
    data_quality: NoteSection;
    what_changed: NoteSection;
  };
  actions: Action[];
  actionsSource: "model" | "template";
  advisory: {
    en: { simple: AdvisoryVariant; standard: AdvisoryVariant };
    hi: { simple: AdvisoryVariant; standard: AdvisoryVariant };
  };
  warnings: string[];
}

export interface Brief {
  id: number;
  createdAt: string;
  audience: Audience;
  label: string;
  /** Set when the pasted text is one of the bundled sample tables. */
  sample: string | null;
  status: "stats" | "written" | "fallback";
  mapping: ColumnMapping;
  table: { headers: string[]; rows: Record<number, string[]> };
  rowFlags: Record<number, RowFlag[]>;
  coverage: Coverage;
  period: string;
  overall: { mean: number | null; validPm25: number };
  stations: StationStat[];
  band: BandKey;
  bandBasis: string;
  findings: Finding[];
  comparison: Comparison | null;
  written: Written | null;
  writeError: string | null;
}
