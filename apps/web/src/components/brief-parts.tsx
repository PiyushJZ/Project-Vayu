import { Button } from "@project-vayu/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@project-vayu/ui/components/card";
import { useState, type ReactNode } from "react";

import { BANDS } from "../../../server/src/brief/bands";
import type {
  AdvisoryVariant,
  BandKey,
  Brief,
  ColumnUnit,
  Written,
} from "../../../server/src/brief/types";
import { Rich, resolveText, type Lang } from "./rich-text";

const BAND_STYLE: Record<BandKey, string> = {
  good: "border-green-600/50 bg-green-600/15 text-green-800 dark:text-green-300",
  satisfactory: "border-lime-600/50 bg-lime-600/15 text-lime-800 dark:text-lime-300",
  moderate: "border-yellow-600/50 bg-yellow-500/15 text-yellow-800 dark:text-yellow-300",
  poor: "border-orange-600/50 bg-orange-500/15 text-orange-800 dark:text-orange-300",
  very_poor: "border-red-600/50 bg-red-600/15 text-red-800 dark:text-red-300",
  severe: "border-fuchsia-800/60 bg-fuchsia-900/20 text-fuchsia-900 dark:text-fuchsia-300",
  unknown: "border-border bg-muted text-muted-foreground",
};

const num = (n: number | null) => (n === null ? "none" : `${Math.round(n * 10) / 10}`);
const UNIT_LABEL: Record<ColumnUnit, string> = {
  "ug/m3": "µg/m³",
  "mg/m3": "mg/m³ (converted to µg/m³)",
  unspecified: "not stated (µg/m³ assumed)",
  other: "not supported (values excluded)",
};

export function BandChip({ band }: { band: BandKey }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-sm font-medium ${BAND_STYLE[band]}`}
    >
      {BANDS[band].en}
    </span>
  );
}

export function Section({
  title,
  description,
  children,
  id,
  action,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {action}
        </div>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
          .catch(() => undefined);
      }}
    >
      {done ? "Copied" : label}
    </Button>
  );
}

function SourceRows({
  brief,
  rowIds,
  limit = 40,
}: {
  brief: Brief;
  rowIds: number[];
  limit?: number;
}) {
  const shown = rowIds.slice(0, limit);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-xs">
        <thead>
          <tr className="border-b">
            <th className="px-2 py-1 font-medium">Row</th>
            {brief.table.headers.map((h, i) => (
              <th key={i} className="px-2 py-1 font-medium">
                {h}
              </th>
            ))}
            <th className="px-2 py-1 font-medium">Flags</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((id) => {
            const flags = brief.rowFlags[id] ?? [];
            return (
              <tr
                key={id}
                className={`border-b align-top ${flags.length ? "bg-destructive/10" : ""}`}
              >
                <td className="px-2 py-1 font-mono">{id}</td>
                {(brief.table.rows[id] ?? []).map((c, i) => (
                  <td key={i} className="px-2 py-1">
                    {c === "" ? <span className="text-muted-foreground">(blank)</span> : c}
                  </td>
                ))}
                <td className="px-2 py-1">
                  {flags.map((f, i) => (
                    <div key={i}>
                      <span className="font-medium">{f.kind === "gap" ? "Gap" : "Excluded"}</span>:{" "}
                      {f.reason}
                    </div>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rowIds.length > limit && (
        <p className="mt-1 text-xs text-muted-foreground">
          Showing the first {limit} of {rowIds.length} rows.
        </p>
      )}
    </div>
  );
}

export function MappingView({ brief }: { brief: Brief }) {
  const m = brief.mapping;
  const col = (i: number | null) =>
    i === null ? "not in the table" : `column ${i + 1}: ${brief.table.headers[i]}`;
  const rows: [string, string][] = [
    ["Station", col(m.station)],
    ["Date and time", col(m.timestamp)],
    ["PM2.5", `${col(m.pm25)}, unit ${UNIT_LABEL[m.pm25Unit]}`],
    ["PM10", `${col(m.pm10)}${m.pm10 === null ? "" : `, unit ${UNIT_LABEL[m.pm10Unit]}`}`],
  ];
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium">
        How the columns were read
        <Tag>{m.source === "model" ? "matched by the model" : "matched by header words"}</Tag>
      </summary>
      <p className="mt-2 text-muted-foreground">
        Check this first. A wrong match changes every number below. The model only chose columns;
        code did all the arithmetic.
      </p>
      {m.warning && (
        <p role="status" className="mt-2 border border-yellow-600/50 bg-yellow-500/10 p-2">
          {m.warning}
        </p>
      )}
      <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {m.notes && <p className="mt-2">Model note: {m.notes}</p>}
    </details>
  );
}

export function StationsTable({ brief }: { brief: Brief }) {
  const qualifying = brief.stations.filter((s) => s.qualifies);
  const hotspot = qualifying.length >= 2 ? qualifying[0] : null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left">
        <thead>
          <tr className="border-b text-xs">
            {[
              "Station",
              "Mean PM2.5 (µg/m³)",
              "Valid / rows",
              "Lowest to highest",
              "Gap rows",
              "Excluded rows",
              "Trend",
              "",
            ].map((h) => (
              <th key={h} className="px-2 py-1 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {brief.stations.map((s) => (
            <tr key={s.key} className="border-b">
              <td className="px-2 py-1.5 font-medium">{s.name}</td>
              <td className="px-2 py-1.5">{num(s.mean)}</td>
              <td className="px-2 py-1.5">
                {s.validPm25} / {s.rows}
              </td>
              <td className="px-2 py-1.5">
                {s.min === null ? "none" : `${num(s.min)} to ${num(s.max)}`}
              </td>
              <td className="px-2 py-1.5">{s.gaps}</td>
              <td className="px-2 py-1.5">{s.suspect}</td>
              <td className="px-2 py-1.5">
                {s.trend === "insufficient" ? "not enough data" : s.trend}
              </td>
              <td className="px-2 py-1.5">
                {hotspot?.key === s.key && (
                  <span className="font-medium text-destructive">Likely hotspot</span>
                )}
                {!s.qualifies && (
                  <span className="text-muted-foreground">Too few valid readings to rank</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataIssues({ brief }: { brief: Brief }) {
  const ids = Object.keys(brief.rowFlags)
    .map(Number)
    .sort((a, b) => a - b);
  if (ids.length === 0) return <p>No gaps or unreliable readings were found.</p>;
  return (
    <div className="grid gap-2">
      <p>
        <span className="font-medium">Gap</span> means a blank or unreadable cell.{" "}
        <span className="font-medium">Excluded</span> means a reading that cannot be right
        (negative, above 1000 µg/m³, PM2.5 above PM10, or the same value four times in a row), so it
        was left out of every average.
      </p>
      <SourceRows brief={brief} rowIds={ids} limit={60} />
    </div>
  );
}

export function ComparisonView({ brief }: { brief: Brief }) {
  const c = brief.comparison;
  if (!c) {
    return <p>No earlier brief to compare. Run a second table to see what changed.</p>;
  }
  const pct = c.overall?.pct;
  return (
    <div className="grid gap-3">
      <p className="text-muted-foreground">
        Compared with brief #{c.previousId} ({c.previousLabel}; {c.previousPeriod}).
      </p>
      <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-muted-foreground">Mean PM2.5</dt>
        <dd>
          {c.overall
            ? `${num(c.overall.prev)} before, ${num(c.overall.curr)} now: ${c.overall.status}${pct === null || pct === undefined ? "" : ` (${pct > 0 ? "+" : ""}${pct}%)`}`
            : "cannot be compared"}
        </dd>
        <dt className="text-muted-foreground">Band</dt>
        <dd>
          {c.band.changed
            ? `${BANDS[c.band.prev].en} to ${BANDS[c.band.curr].en}`
            : `unchanged at ${BANDS[c.band.curr].en}`}
        </dd>
        <dt className="text-muted-foreground">Hotspot</dt>
        <dd>
          {c.hotspot.changed
            ? `${c.hotspot.prev ?? "none named"} to ${c.hotspot.curr ?? "none named"}`
            : `unchanged: ${c.hotspot.curr ?? "none named"}`}
        </dd>
        <dt className="text-muted-foreground">Data quality</dt>
        <dd>
          Rows with gaps: {c.coverage.prevGapRows} before, {c.coverage.currGapRows} now. Rows with
          excluded readings: {c.coverage.prevSuspectRows} before, {c.coverage.currSuspectRows} now.
        </dd>
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="border-b text-xs">
              {["Station", "Before", "Now", "Change"].map((h) => (
                <th key={h} className="px-2 py-1 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.stations.map((s) => (
              <tr key={s.station} className="border-b">
                <td className="px-2 py-1.5 font-medium">{s.station}</td>
                <td className="px-2 py-1.5">{num(s.prevMean)}</td>
                <td className="px-2 py-1.5">{num(s.currMean)}</td>
                <td className="px-2 py-1.5">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ActionsView({
  brief,
  written,
  cite,
}: {
  brief: Brief;
  written: Written;
  cite: (id: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {written.actionsSource === "template" && (
        <p role="status" className="border border-yellow-600/50 bg-yellow-500/10 p-2">
          These actions were written by code, not the model, because the model's actions did not
          pass the checks.
        </p>
      )}
      <ol className="grid gap-3">
        {written.actions.map((a, i) => (
          <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-2">
            <span className="font-mono text-muted-foreground">{i + 1}.</span>
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-muted-foreground">
                {a.who}, {a.timeframe}
              </div>
              <p className="mt-1">
                <Rich text={a.detail} findings={brief.findings} band={brief.band} onCite={cite} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on:{" "}
                {a.findingIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => cite(id)}
                    className="mr-1.5 text-primary underline underline-offset-2 hover:no-underline"
                  >
                    {id}
                  </button>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const NOTE_SECTIONS: [keyof Written["note"], string][] = [
  ["summary", "Summary"],
  ["hotspots_and_trend", "Hotspots and trend"],
  ["data_quality", "Data quality and limits"],
  ["what_changed", "What changed since the last brief"],
];

export function noteText(brief: Brief, written: Written): string {
  const r = (t: string) => resolveText(t, brief.findings, brief.band);
  return [
    r(written.note.headline.text),
    ...NOTE_SECTIONS.map(([k, label]) => `${label}\n${r(written.note[k].text)}`),
    `Priority actions\n${written.actions.map((a, i) => `${i + 1}. ${a.title} (${a.who}, ${a.timeframe}). ${r(a.detail)}`).join("\n")}`,
  ].join("\n\n");
}

export function NoteView({
  brief,
  written,
  cite,
}: {
  brief: Brief;
  written: Written;
  cite: (id: string) => void;
}) {
  const rich = (t: string) => (
    <Rich text={t} findings={brief.findings} band={brief.band} onCite={cite} />
  );
  return (
    <div className="grid gap-3">
      <h3 className="text-base font-medium">
        {rich(written.note.headline.text)}
        {written.note.headline.source === "template" && <Tag>code-written</Tag>}
      </h3>
      {NOTE_SECTIONS.map(([k, label]) => (
        <div key={k}>
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
            {written.note[k].source === "template" && <Tag>code-written</Tag>}
          </h4>
          <p className="mt-0.5">{rich(written.note[k].text)}</p>
        </div>
      ))}
    </div>
  );
}

type GroupKey = "general" | "children" | "older_adults" | "sensitive";

const GROUPS: [GroupKey, Record<Lang, string>][] = [
  ["general", { en: "Everyone", hi: "सभी के लिए" }],
  ["children", { en: "Children", hi: "बच्चे" }],
  ["older_adults", { en: "Older adults", hi: "बुज़ुर्ग" }],
  [
    "sensitive",
    {
      en: "People sensitive to poor air (asthma, heart or lung conditions)",
      hi: "जिन्हें खराब हवा से परेशानी होती है (अस्थमा, दिल या फेफड़ों की बीमारी)",
    },
  ],
];

function advisoryText(brief: Brief, v: AdvisoryVariant, lang: Lang): string {
  const r = (t: string) => resolveText(t, brief.findings, brief.band, lang);
  return [r(v.headline), ...GROUPS.map(([k, label]) => `${label[lang]}: ${r(v[k])}`)].join("\n");
}

export function AdvisoryView({
  brief,
  written,
  cite,
}: {
  brief: Brief;
  written: Written;
  cite: (id: string) => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [level, setLevel] = useState<"simple" | "standard">("simple");
  const v = written.advisory[lang][level];
  // Fixed fallback text is English even when Hindi was asked for.
  const shownLang: Lang = v.source === "fixed" ? "en" : lang;

  const toggle = <T extends string>(value: T, current: T, set: (v: T) => void, label: string) => (
    <Button
      type="button"
      size="sm"
      variant={value === current ? "default" : "outline"}
      aria-pressed={value === current}
      onClick={() => set(value)}
    >
      {label}
    </Button>
  );

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label="Language">
          {toggle<Lang>("en", lang, setLang, "English")}
          {toggle<Lang>("hi", lang, setLang, "हिन्दी")}
        </div>
        <div className="flex gap-1" role="group" aria-label="Reading level">
          {toggle("simple", level, setLevel, "Simple words")}
          {toggle("standard", level, setLevel, "Standard")}
        </div>
        <div className="ml-auto">
          <CopyButton text={advisoryText(brief, v, shownLang)} label="Copy advisory" />
        </div>
      </div>

      {lang === "hi" && (
        <p role="note" className="border border-yellow-600/60 bg-yellow-500/10 p-2 font-medium">
          Machine-translated. Have a Hindi speaker review this before you publish it.
        </p>
      )}
      {v.source === "fixed" && v.warning && (
        <p role="status" className="border border-orange-600/60 bg-orange-500/10 p-2">
          {v.warning}
        </p>
      )}

      <article lang={shownLang} className="grid gap-2 border p-3">
        <h3 className="text-base font-medium">
          <Rich
            text={v.headline}
            findings={brief.findings}
            band={brief.band}
            lang={shownLang}
            onCite={cite}
          />
        </h3>
        {GROUPS.map(([k, label]) => (
          <div key={k}>
            <h4 className="text-xs font-medium text-muted-foreground">{label[shownLang]}</h4>
            <p className="mt-0.5 text-base">
              <Rich
                text={v[k]}
                findings={brief.findings}
                band={brief.band}
                lang={shownLang}
                onCite={cite}
              />
            </p>
          </div>
        ))}
      </article>
      <p className="text-xs text-muted-foreground">
        Band: {BANDS[brief.band].en} ({BANDS[brief.band].range}). {brief.bandBasis}. This advisory
        comes only from the readings supplied. It does not replace official CPCB or SAFAR bulletins
        or medical advice.
      </p>
    </div>
  );
}

export function FindingsList({
  brief,
  openIds,
  setOpen,
}: {
  brief: Brief;
  openIds: Set<string>;
  setOpen: (id: string, open: boolean) => void;
}) {
  return (
    <ul className="grid gap-1">
      {brief.findings.map((f) => (
        <li key={f.id} id={`finding-${f.id}`} className="scroll-mt-4 border-b py-1.5">
          <details
            open={openIds.has(f.id)}
            onToggle={(e) => setOpen(f.id, (e.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer">
              <span className="mr-2 font-mono text-xs">{f.id}</span>
              <span className="text-muted-foreground">{f.label}:</span>{" "}
              <span className="font-medium">{f.display}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {f.rowIds.length === 0 ? "no source rows" : `${f.rowIds.length} source rows`}
              </span>
            </summary>
            <div className="mt-2">
              {f.prevBriefId !== undefined && (
                <p className="mb-1 text-xs text-muted-foreground">
                  This compares with brief #{f.prevBriefId}. The rows below are from this brief.
                </p>
              )}
              {f.rowIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  This finding is not computed from specific rows.
                </p>
              ) : (
                <SourceRows brief={brief} rowIds={f.rowIds} />
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
