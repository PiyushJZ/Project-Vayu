import { Button } from "@project-vayu/ui/components/button";
import { Card, CardContent } from "@project-vayu/ui/components/card";
import { Check, ChevronRight, Copy } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { BANDS } from "../../../server/src/brief/bands";
import type {
  AdvisoryVariant,
  BandKey,
  Brief,
  ColumnUnit,
  StationStat,
  Written,
} from "../../../server/src/brief/types";
import { CiteChip, Rich, resolveText, type Lang } from "./rich-text";

/** Band colours are fills only. The band's name always stands beside them in ink. */
const BAND_FILL: Record<BandKey, string> = {
  good: "bg-band-good",
  satisfactory: "bg-band-satisfactory",
  moderate: "bg-band-moderate",
  poor: "bg-band-poor",
  very_poor: "bg-band-very-poor",
  severe: "bg-band-severe",
  unknown: "bg-band-unknown",
};

const BAND_ORDER: BandKey[] = ["good", "satisfactory", "moderate", "poor", "very_poor", "severe"];

const num = (n: number | null) => (n === null ? "none" : `${Math.round(n * 10) / 10}`);
const UNIT_LABEL: Record<ColumnUnit, string> = {
  "ug/m3": "µg/m³",
  "mg/m3": "mg/m³ (converted to µg/m³)",
  unspecified: "not stated (µg/m³ assumed)",
  other: "not supported (values excluded)",
};

const TH = "px-3 py-2 text-left align-bottom t-label text-muted-foreground";
const TD = "px-3 py-3 align-top";

export function BandChip({ band, className = "" }: { band: BandKey; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className={`size-3.5 shrink-0 rounded-full ${BAND_FILL[band]}`} />
      {BANDS[band].en}
    </span>
  );
}

/** The brief's band, placed on the six CPCB bands so a reader sees how far up the scale it sits. */
export function BandScale({ brief }: { brief: Brief }) {
  const { band } = brief;
  return (
    <Card>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="t-h3">
            <BandChip band={band} />
          </p>
          <p className="text-muted-foreground">{BANDS[band].range}</p>
        </div>
        <ol aria-label="CPCB PM2.5 bands" className="grid grid-cols-6 gap-1.5">
          {BAND_ORDER.map((k) => (
            <li
              key={k}
              aria-current={k === band ? "true" : undefined}
              className="grid content-start gap-2"
            >
              <span
                aria-hidden="true"
                className={`h-2 rounded-full ${BAND_FILL[k]} ${k === band ? "" : "opacity-30"}`}
              />
              <span
                className={`t-label max-sm:sr-only ${k === band ? "" : "font-normal text-muted-foreground"}`}
              >
                {BANDS[k].en}
              </span>
            </li>
          ))}
        </ol>
        <p className="t-small text-muted-foreground">Band source: {brief.bandBasis}</p>
      </CardContent>
    </Card>
  );
}

/** One titled part of the brief: its name on the left line, what it holds on the split line, then the content. */
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
  const titleId = useId();
  return (
    <section id={id} aria-labelledby={titleId} className="grid grid-cols-1 gap-6">
      <div className="grid gap-x-6 gap-y-2 lg:grid-cols-12 lg:items-end">
        <h3 id={titleId} className="t-h3 lg:col-span-6 xl:col-span-5">
          {title}
        </h3>
        {(description || action) && (
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 lg:col-span-6 xl:col-start-7">
            {description && <p className="measure t-small text-muted-foreground">{description}</p>}
            {action && <div className="ml-auto">{action}</div>}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/** A note set apart from the text around it. The words carry the meaning; the tint only marks it. */
export function Callout({
  tone = "caution",
  role,
  className = "",
  children,
}: {
  tone?: "caution" | "error";
  role?: "note" | "status" | "alert";
  className?: string;
  children: ReactNode;
}) {
  const tint =
    tone === "error"
      ? "border-destructive/45 bg-destructive/10"
      : "border-caution/45 bg-caution/10";
  return (
    <div role={role} className={`rounded-lg border px-4 py-3 ${tint} ${className}`}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border whitespace-nowrap border-border-strong px-2 py-0.5 align-middle text-[0.8125rem] leading-[1.4] font-normal tracking-normal text-muted-foreground">
      {children}
    </span>
  );
}

function Chevron() {
  return (
    <ChevronRight
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground transition-[rotate] duration-150 ease-ui group-open:rotate-90 motion-reduce:transition-none"
    />
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <span role="status" className="t-small text-destructive empty:hidden">
        {state === "failed" && "The browser blocked copying. Select the text and copy it by hand."}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          // navigator.clipboard is undefined outside a secure context, so that failure lands here too.
          Promise.resolve()
            .then(() => navigator.clipboard.writeText(text))
            .then(() => {
              setState("done");
              setTimeout(() => setState("idle"), 1500);
            })
            .catch(() => setState("failed"));
        }}
      >
        {state === "done" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {state === "done" ? "Copied" : label}
      </Button>
    </span>
  );
}

/** A choice between a few named options, shown side by side. */
function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; lang?: Lang }[];
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-1 rounded-sm bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.lang}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className="h-9 min-w-11 rounded-[5px] px-3 t-small font-medium text-muted-foreground transition-colors duration-[120ms] ease-ui hover:text-foreground hover:duration-150 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_0_0_1px_var(--border-strong)] max-sm:h-11"
        >
          {o.label}
        </button>
      ))}
    </div>
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
    <div className="grid min-w-0 grid-cols-1 gap-2">
      <div className="overflow-x-auto rounded-lg border bg-background">
        {/* Pasted cells stay on one line, as they were typed; only the flag wraps. */}
        <table className="w-full border-collapse text-left whitespace-nowrap">
          <thead>
            <tr className="border-b">
              <th className={TH}>Row</th>
              {brief.table.headers.map((h, i) => (
                <th key={i} className={TH}>
                  {h}
                </th>
              ))}
              <th className={TH}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((id) => {
              const flags = (brief.rowFlags[id] ?? []).filter(
                (f, i, all) =>
                  all.findIndex((x) => x.kind === f.kind && x.reason === f.reason) === i,
              );
              return (
                <tr
                  key={id}
                  // An excluded reading is wrong, a gap is only missing, so they read at different strengths.
                  className={`border-b align-top last:border-b-0 ${
                    flags.some((f) => f.kind !== "gap")
                      ? "bg-destructive/10"
                      : flags.length
                        ? "bg-caution/10"
                        : ""
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-[0.8125rem] text-muted-foreground">
                    {id}
                  </td>
                  {(brief.table.rows[id] ?? []).map((c, i) => (
                    <td key={i} className="px-3 py-2 font-mono text-[0.8125rem]">
                      {c === "" ? <span className="text-muted-foreground">(blank)</span> : c}
                    </td>
                  ))}
                  <td className="min-w-64 px-3 py-2 t-small whitespace-normal">
                    {flags.map((f, i) => (
                      <div key={i}>
                        <span className="font-medium">{f.kind === "gap" ? "Gap" : "Excluded"}</span>
                        : {f.reason}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rowIds.length > limit && (
        <p className="t-small text-muted-foreground">
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
    <details className="group rounded-xl border bg-card">
      <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-3 sm:px-6">
        <Chevron />
        <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
          <span className="font-medium">How the columns were read</span>
          <Tag>{m.source === "model" ? "matched by the model" : "matched by header words"}</Tag>
        </span>
      </summary>
      <div className="grid gap-4 px-4 pb-5 sm:px-6 sm:pb-6 lg:grid-cols-12 lg:gap-x-6">
        <div className="grid content-start gap-3 lg:col-span-6 xl:col-span-5">
          <p className="measure text-muted-foreground">
            Check this first. A wrong match changes every number below. The model only chose
            columns; code did all the arithmetic.
          </p>
          {m.warning && (
            <Callout role="status" className="t-small">
              {m.warning}
            </Callout>
          )}
        </div>
        <div className="grid content-start gap-3 lg:col-span-6 xl:col-start-7">
          <dl>
            {rows.map(([k, v]) => (
              <div
                key={k}
                className="grid gap-x-4 border-b py-2.5 first:pt-0 last:border-b-0 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="t-label text-muted-foreground sm:pt-0.5">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {m.notes && <p className="t-small text-muted-foreground">Model note: {m.notes}</p>}
        </div>
      </div>
    </details>
  );
}

const TREND: Record<StationStat["trend"], { glyph: string; text: string }> = {
  rising: { glyph: "↗", text: "rising" },
  falling: { glyph: "↘", text: "falling" },
  steady: { glyph: "→", text: "steady" },
  insufficient: { glyph: "", text: "not enough data" },
};

export function StationsTable({ brief }: { brief: Brief }) {
  const qualifying = brief.stations.filter((s) => s.qualifies);
  const hotspot = qualifying.length >= 2 ? qualifying[0] : null;
  const top = Math.max(0, ...brief.stations.map((s) => s.mean ?? 0));
  return (
    <Card>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="border-b">
              {[
                "Station",
                "Mean PM2.5 (µg/m³)",
                "Valid / rows",
                "Lowest to highest",
                "Gap rows",
                "Excluded rows",
                "Trend",
              ].map((h) => (
                <th key={h} className={`${TH} first:pl-0 last:pr-0`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brief.stations.map((s) => (
              <tr key={s.key} className="border-b last:border-b-0">
                <td className={`${TD} pl-0 font-medium`}>
                  {s.name}
                  {/* Kept in the first column so it stays on screen when a phone scrolls the table sideways. */}
                  {hotspot?.key === s.key && (
                    <div className="t-small font-medium text-destructive">Likely hotspot</div>
                  )}
                  {!s.qualifies && (
                    <div className="t-small font-normal text-muted-foreground">
                      Too few valid readings to rank
                    </div>
                  )}
                </td>
                <td className={TD}>
                  {num(s.mean)}
                  {/* The bar repeats the number beside it as a length, so the stations compare at a glance. */}
                  {s.mean !== null && top > 0 && (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 block h-1 w-28 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className={`block h-full rounded-full ${hotspot?.key === s.key ? "bg-destructive" : "bg-foreground/45"}`}
                        style={{ width: `${Math.max(2, (s.mean / top) * 100)}%` }}
                      />
                    </span>
                  )}
                </td>
                <td className={TD}>
                  {s.validPm25} / {s.rows}
                </td>
                <td className={TD}>{s.min === null ? "none" : `${num(s.min)} to ${num(s.max)}`}</td>
                <td className={TD}>{s.gaps}</td>
                <td className={TD}>{s.suspect}</td>
                <td
                  className={`${TD} pr-0 ${s.trend === "insufficient" ? "text-muted-foreground" : ""}`}
                >
                  {TREND[s.trend].glyph && (
                    <span aria-hidden="true" className="mr-1.5">
                      {TREND[s.trend].glyph}
                    </span>
                  )}
                  {TREND[s.trend].text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function DataIssues({ brief }: { brief: Brief }) {
  const ids = Object.keys(brief.rowFlags)
    .map(Number)
    .sort((a, b) => a - b);
  return (
    <Card>
      <CardContent className="grid gap-5">
        {ids.length === 0 ? (
          <p>No gaps or unreliable readings were found.</p>
        ) : (
          <>
            <p className="measure">
              <span className="font-medium">Gap</span> means a blank or unreadable cell.{" "}
              <span className="font-medium">Excluded</span> means a reading that cannot be right
              (negative, above 1000 µg/m³, PM2.5 above PM10, or the same value four times in a row),
              so it was left out of every average.
            </p>
            <SourceRows brief={brief} rowIds={ids} limit={60} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ComparisonView({ brief }: { brief: Brief }) {
  const c = brief.comparison;
  if (!c) {
    return (
      <Card>
        <CardContent>
          <p>No earlier brief to compare. Run a second table to see what changed.</p>
        </CardContent>
      </Card>
    );
  }
  const pct = c.overall?.pct;
  const facts: [string, ReactNode][] = [
    [
      "Mean PM2.5",
      c.overall
        ? `${num(c.overall.prev)} before, ${num(c.overall.curr)} now: ${c.overall.status}${pct === null || pct === undefined ? "" : ` (${pct > 0 ? "+" : ""}${pct}%)`}`
        : "cannot be compared",
    ],
    [
      "Band",
      c.band.changed
        ? `${BANDS[c.band.prev].en} to ${BANDS[c.band.curr].en}`
        : `unchanged at ${BANDS[c.band.curr].en}`,
    ],
    [
      "Hotspot",
      c.hotspot.changed
        ? `${c.hotspot.prev ?? "none named"} to ${c.hotspot.curr ?? "none named"}`
        : `unchanged: ${c.hotspot.curr ?? "none named"}`,
    ],
    [
      "Data quality",
      `Rows with gaps: ${c.coverage.prevGapRows} before, ${c.coverage.currGapRows} now. Rows with excluded readings: ${c.coverage.prevSuspectRows} before, ${c.coverage.currSuspectRows} now.`,
    ],
  ];
  return (
    <Card>
      <CardContent className="grid gap-x-6 gap-y-6 lg:grid-cols-12">
        <div className="grid content-start gap-4 lg:col-span-6 xl:col-span-5">
          <p className="text-muted-foreground">
            Compared with the previous brief: {c.previousLabel} ({c.previousPeriod}).
          </p>
          <dl>
            {facts.map(([k, v]) => (
              <div key={k} className="grid gap-0.5 border-b py-3 last:border-b-0">
                <dt className="t-label text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="overflow-x-auto lg:col-span-6 xl:col-start-7">
          {/* Four short columns fit a phone when the change wraps, so this table never scrolls sideways. */}
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b">
                {["Station", "Before", "Now", "Change"].map((h) => (
                  <th key={h} className={`${TH} first:pl-0 last:pr-0`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.stations.map((s) => (
                <tr key={s.station} className="border-b last:border-b-0">
                  <td className={`${TD} pl-0 font-medium`}>{s.station}</td>
                  <td className={TD}>{num(s.prevMean)}</td>
                  <td className={TD}>{num(s.currMean)}</td>
                  <td className={`${TD} pr-0`}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
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
  const rich = (t: string) => (
    <Rich text={t} findings={brief.findings} band={brief.band} onCite={cite} />
  );
  return (
    <div className="grid gap-4">
      {written.actionsSource === "template" && (
        <Callout role="status" className="t-small font-medium">
          These actions were written by code, not the model, because the model's actions did not
          pass the checks.
        </Callout>
      )}
      <ol className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {written.actions.map((a, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-6">
            <span aria-hidden="true" className="t-h3 text-muted-foreground">
              {i + 1}
            </span>
            <div className="grid gap-1">
              {/* The model may use placeholders in any of these fields, so none is printed raw. */}
              <div className="t-h4">{rich(a.title)}</div>
              <div className="t-small text-muted-foreground">
                {rich(a.who)}, {a.timeframe}
              </div>
            </div>
            <p>{rich(a.detail)}</p>
            <p className="mt-auto flex flex-wrap items-center gap-2 pt-2 t-small text-muted-foreground">
              Based on:
              {a.findingIds.map((id) => (
                <CiteChip key={id} id={id} onCite={cite} />
              ))}
            </p>
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
    `Priority actions\n${written.actions.map((a, i) => `${i + 1}. ${r(a.title)} (${r(a.who)}, ${a.timeframe}). ${r(a.detail)}`).join("\n")}`,
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
    <Card>
      <CardContent className="grid gap-x-6 gap-y-6 lg:grid-cols-12">
        <h4 className="t-h3 lg:col-span-6 xl:col-span-5">
          {rich(written.note.headline.text)}
          {written.note.headline.source === "template" && <Tag>code-written</Tag>}
        </h4>
        <div className="grid content-start lg:col-span-6 xl:col-start-7">
          {NOTE_SECTIONS.map(([k, label]) => (
            <div key={k} className="grid gap-1 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
              <h5 className="t-label text-muted-foreground">
                {label}
                {written.note[k].source === "template" && <Tag>code-written</Tag>}
              </h5>
              <p className="measure">{rich(written.note[k].text)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Language"
            value={lang}
            onChange={setLang}
            options={[
              { value: "en", label: "English" },
              { value: "hi", label: "हिन्दी", lang: "hi" },
            ]}
          />
          <Segmented
            label="Reading level"
            value={level}
            onChange={setLevel}
            options={[
              { value: "simple", label: "Simple words" },
              { value: "standard", label: "Standard" },
            ]}
          />
          <div className="ml-auto">
            <CopyButton text={advisoryText(brief, v, shownLang)} label="Copy advisory" />
          </div>
        </div>

        {lang === "hi" && (
          <Callout role="note" className="t-small font-medium">
            Machine-translated. Have a Hindi speaker review this before you publish it.
          </Callout>
        )}
        {v.source === "fixed" && v.warning && (
          <Callout role="status" className="t-small">
            {v.warning}
          </Callout>
        )}

        <article
          lang={shownLang}
          className="grid gap-6 rounded-lg border bg-background p-4 sm:p-8 lg:grid-cols-12 lg:gap-x-6"
        >
          <div className="flex items-start gap-3 lg:col-span-6 xl:col-span-5">
            <span
              aria-hidden="true"
              className={`mt-[0.45em] size-3.5 shrink-0 rounded-full ${BAND_FILL[brief.band]}`}
            />
            <h4 className="t-h3">
              <Rich
                text={v.headline}
                findings={brief.findings}
                band={brief.band}
                lang={shownLang}
                onCite={cite}
              />
            </h4>
          </div>
          <div className="grid content-start lg:col-span-6 xl:col-start-7">
            {GROUPS.map(([k, label]) => (
              <div
                key={k}
                className="grid gap-1 border-b py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <h5 className="t-label text-muted-foreground lang-hi:text-[0.9375rem]">
                  {label[shownLang]}
                </h5>
                <p className="measure text-lg/[1.6]">
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
          </div>
        </article>
        <p className="t-small text-muted-foreground">
          Band: {BANDS[brief.band].en} ({BANDS[brief.band].range}). {brief.bandBasis} This advisory
          comes only from the readings supplied. It does not replace official CPCB or SAFAR
          bulletins or medical advice.
        </p>
      </CardContent>
    </Card>
  );
}

export function FindingsList({
  brief,
  openIds,
  setOpen,
  citedId,
}: {
  brief: Brief;
  openIds: Set<string>;
  setOpen: (id: string, open: boolean) => void;
  /** The finding a figure in the text last pointed at, marked so the reader sees where they landed. */
  citedId?: string | null;
}) {
  return (
    <Card>
      <CardContent>
        <ul>
          {brief.findings.map((f) => (
            <li
              key={f.id}
              id={`finding-${f.id}`}
              className={`-mx-2 rounded-sm border-b px-2 last:border-b-0 ${citedId === f.id ? "bg-primary/10" : ""}`}
            >
              <details
                className="group"
                open={openIds.has(f.id)}
                onToggle={(e) => setOpen(f.id, (e.currentTarget as HTMLDetailsElement).open)}
              >
                <summary className="flex min-h-12 list-none flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <Chevron />
                  <span className="w-9 font-mono text-[0.8125rem] text-muted-foreground">
                    {f.id}
                  </span>
                  <span className="min-w-0 flex-1 basis-64">
                    <span className="text-muted-foreground">{f.label}:</span>{" "}
                    <span className="font-medium">{f.display}</span>
                  </span>
                  <span className="t-small text-muted-foreground">
                    {f.rowIds.length === 0
                      ? "no source rows"
                      : `${f.rowIds.length} source row${f.rowIds.length === 1 ? "" : "s"}`}
                  </span>
                </summary>
                <div className="grid gap-2 pt-1 pb-4">
                  {f.prevBriefId !== undefined && (
                    <p className="t-small text-muted-foreground">
                      This compares with brief #{f.prevBriefId}. The rows below are from this brief.
                    </p>
                  )}
                  {f.rowIds.length === 0 ? (
                    <p className="t-small text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
