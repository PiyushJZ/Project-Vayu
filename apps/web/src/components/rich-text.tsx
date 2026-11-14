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
            {f.display}
            <button
              type="button"
              onClick={() => onCite(f.id)}
              aria-label={`Show the source rows for ${f.id}`}
              className="ml-0.5 align-super text-[10px] leading-none text-primary underline underline-offset-2 hover:no-underline"
            >
              {f.id}
            </button>
          </span>
        );
      })}
    </>
  );
}
