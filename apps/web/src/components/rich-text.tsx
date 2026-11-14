import { BANDS } from "../../../server/src/brief/bands";
import type { BandKey, Finding } from "../../../server/src/brief/types";

export type Lang = "en" | "hi";

const TOKEN = /(\{(?:F\d+|BAND)\})/g;
const EXACT = /^\{(F\d+|BAND)\}$/;

/** Plain-text version, for copying. */
export function resolveText(
  text: string,
  findings: Finding[],
  band: BandKey,
  lang: Lang = "en",
): string {
  return text.replace(/\{(F\d+|BAND)\}/g, (_, t: string) =>
    t === "BAND" ? BANDS[band][lang] : (findings.find((f) => f.id === t)?.display ?? ""),
  );
}

/** The small finding id beside a figure. Selecting it opens that finding's source rows. */
export function CiteChip({ id, onCite }: { id: string; onCite: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onCite(id)}
      aria-label={`Show the source rows for ${id}`}
      // The ::after widens the tap area without moving the text around the chip.
      className="relative inline-flex h-[1.375rem] items-center rounded-[6px] border border-border-strong px-1.5 align-[0.08em] font-mono text-[0.8125rem] leading-none font-normal text-muted-foreground transition-colors duration-[120ms] ease-ui after:absolute after:-inset-x-1 after:-inset-y-2.5 hover:border-primary hover:text-foreground hover:duration-150"
    >
      {id}
    </button>
  );
}

/** Replaces {Fn} and {BAND} with the text code computed, and links each figure to its source rows. */
export function Rich({
  text,
  findings,
  band,
  lang = "en",
  onCite,
}: {
  text: string;
  findings: Finding[];
  band: BandKey;
  lang?: Lang;
  onCite: (id: string) => void;
}) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        const m = part.match(EXACT);
        if (!m) return part;
        if (m[1] === "BAND") return <strong key={i}>{BANDS[band][lang]}</strong>;
        const f = findings.find((x) => x.id === m[1]);
        if (!f) return null;
        return (
          <span key={i}>
            <span className="font-medium">{f.display}</span> <CiteChip id={f.id} onCite={onCite} />
          </span>
        );
      })}
    </>
  );
}
