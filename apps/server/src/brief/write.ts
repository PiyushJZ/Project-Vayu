import { z } from "zod";

import { AUDIENCE_LABEL, AUDIENCE_LEVERS, BANDS, GUIDANCE, fixedAdvisory } from "./bands";
import { type LlmConfig, chatJson } from "./llm";
import type { Action, AdvisoryText, AdvisoryVariant, Brief, NoteSection, Written } from "./types";

/** Longest silence allowed while the reply streams in. The whole call may take a few times longer. */
const WRITE_TIMEOUT_MS = 60_000;
const NO_PREVIOUS = "No earlier brief to compare.";

const Str = (max: number) => z.string().min(1).max(max);
const AdvisoryReply = z.object({
  headline: Str(200),
  general: Str(600),
  children: Str(600),
  older_adults: Str(600),
  sensitive: Str(700),
});
const Variants = z.object({ simple: AdvisoryReply, standard: AdvisoryReply });
const WriteReply = z.object({
  actions: z
    .array(
      z.object({
        title: Str(160),
        detail: Str(500),
        who: Str(100),
        timeframe: z.enum(["today", "this week", "this month"]),
        finding_ids: z.array(z.string()).min(1).max(6),
      }),
    )
    .min(2)
    .max(8),
  note: z.object({
    headline: Str(250),
    summary: Str(1000),
    hotspots_and_trend: Str(1000),
    data_quality: Str(1000),
    what_changed: Str(1000),
  }),
  advisory: z.object({ en: Variants, hi: Variants }),
});
type Reply = z.infer<typeof WriteReply>;

const SYSTEM = `You write briefs for local air quality teams in India. A program has already parsed the data and computed every number as a numbered finding. You only write the words around those findings.

Hard rules. Text that breaks them is thrown away and replaced.
1. Never type a digit (0-9 or Devanagari digits) yourself. To quote any figure, date, count or measurement, write its finding id in braces, for example {F3}. The program swaps in the exact text and links the source rows. Station names may be written exactly as given. Write "PM2.5" and "PM10" as shown.
   Each placeholder is replaced, as it stands, by the text in the findings list. Write the sentence so it reads naturally with that exact text in place, and do not repeat what the text already says. For example write "The trend was {F7}", not "PM2.5 was rising ({F7})".
2. Wherever you name the overall air quality category, write {BAND}. The program swaps in the correct word for each language. Use {BAND} only for the overall category the advisory is set to, never to describe a single station or a part of the period.
3. Say only what the findings show. The data has no information about pollution sources, so do not name causes such as traffic, burning or industry as facts. You may say a cause is possible and should be checked. A hotspot is the station with the highest mean, not a located source.
4. Mention gaps and unreliable readings wherever they limit what can be concluded. Never make the data sound better than it is.
5. Actions: ranked, most urgent first, four to six. Each must be something the audience can actually do, using only the levers listed for them. Each cites at least one finding id in finding_ids (like "F3", without braces).
6. Citizen advisory: base it on the BASE GUIDANCE for the band. Reword it for the reading level and language. Do not add, remove or soften any precaution. No diagnosis, no medicine names, no doses. Keep children, older adults and people sensitive to poor air (asthma, heart or lung conditions) in their own fields, and put advice for everyone else in "general".
7. Reading levels. "simple": everyday words, sentences of at most 12 words, no technical terms, and no {F..} placeholders at all (only {BAND} is allowed). "standard": clear plain language for an adult, and it may cite findings with {F..}.
8. Hindi: natural, everyday Devanagari Hindi, not a word-for-word translation. Keep station names, "PM2.5" and "PM10" in Latin letters. For each reading level, the Hindi and English versions must use exactly the same set of placeholders.
9. Every advisory headline contains {BAND}.
10. Keep advisory fields to one or two sentences. The internal note is for the audience's own team: factual paragraphs of two to four sentences.
Reply with one JSON object and nothing else.`;

function buildUser(brief: Brief): string {
  const findings = brief.findings
    .map((f) => `${f.id} | ${f.label} | ${f.display} | source rows: ${f.rowIds.length}`)
    .join("\n");
  const band = BANDS[brief.band];
  return `AUDIENCE: ${AUDIENCE_LABEL[brief.audience]}
What they can do: ${AUDIENCE_LEVERS[brief.audience]}

AIR QUALITY BAND (code-chosen): ${band.en} (${band.range}). Basis: ${brief.bandBasis}

FINDINGS (id | what it is | the text that replaces {id}):
${findings}

${brief.comparison ? `A previous brief exists (#${brief.comparison.previousId}). what_changed must describe the change findings.` : `There is no earlier brief, so set what_changed to exactly: "${NO_PREVIOUS}"`}

BASE GUIDANCE for the ${band.en} band (English, fixed by the program):
${JSON.stringify(GUIDANCE[brief.band], null, 2)}

Return JSON of exactly this shape:
{
  "actions": [{ "title": "", "detail": "", "who": "", "timeframe": "today" | "this week" | "this month", "finding_ids": ["F1"] }],
  "note": { "headline": "", "summary": "", "hotspots_and_trend": "", "data_quality": "", "what_changed": "" },
  "advisory": {
    "en": { "simple": ADV, "standard": ADV },
    "hi": { "simple": ADV, "standard": ADV }
  }
}
where ADV is { "headline": "", "general": "", "children": "", "older_adults": "", "sensitive": "" }`;
}

const PLACEHOLDER = /\{([^{}]*)\}/g;
const ALLOWED_TOKENS = /PM\s?2\.5|PM\s?10|पीएम\s?2\.5|पीएम\s?10|µg\/m3|μg\/m3|ug\/m3|\bm3\b/gi;

interface Ctx {
  ids: Set<string>;
  names: string[];
}

type Checked = { ok: true; tokens: string[] } | { ok: false; reason: string };

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Accepts text only when every number comes from a placeholder that exists. */
export function checkText(text: string, ctx: Ctx, allowFindings: boolean): Checked {
  const tokens: string[] = [];
  for (const m of text.matchAll(PLACEHOLDER)) {
    const t = m[1]!;
    if (t === "BAND") tokens.push(t);
    else if (/^F\d+$/.test(t)) {
      if (!ctx.ids.has(t)) return { ok: false, reason: `unknown finding {${t}}` };
      if (!allowFindings) return { ok: false, reason: `{${t}} is not allowed at the simple level` };
      tokens.push(t);
    } else return { ok: false, reason: `unknown placeholder {${t}}` };
  }
  let rest = text.replace(PLACEHOLDER, " ");
  if (/[{}]/.test(rest)) return { ok: false, reason: "unbalanced braces" };
  for (const name of [...ctx.names].sort((a, b) => b.length - a.length)) {
    rest = rest.replace(new RegExp(escapeRe(name), "gi"), " ");
  }
  rest = rest.replace(ALLOWED_TOKENS, " ");
  const digit = rest.match(/.{0,12}\p{Nd}.{0,12}/u);
  if (digit)
    return {
      ok: false,
      reason: `a number was written outside a placeholder ("${digit[0]!.trim()}")`,
    };
  return { ok: true, tokens };
}

function checkVariant(
  v: z.infer<typeof AdvisoryReply>,
  level: "simple" | "standard",
  lang: "en" | "hi",
  ctx: Ctx,
): { ok: true; tokens: string } | { ok: false; reason: string } {
  const all = new Set<string>();
  for (const [field, text] of Object.entries(v)) {
    const c = checkText(text, ctx, level === "standard");
    if (!c.ok) return { ok: false, reason: `${field}: ${c.reason}` };
    c.tokens.forEach((t) => all.add(t));
    const hasDevanagari = /[ऀ-ॿ]/.test(text);
    if (lang === "hi" && !hasDevanagari)
      return { ok: false, reason: `${field}: not written in Hindi` };
    if (lang === "en" && hasDevanagari)
      return { ok: false, reason: `${field}: contains Hindi text` };
  }
  if (!v.headline.includes("{BAND}"))
    return { ok: false, reason: "headline does not name the band" };
  return { ok: true, tokens: [...all].sort().join(",") };
}

function fixed(brief: Brief, warning: string): AdvisoryVariant {
  return { ...fixedAdvisory(brief.band), source: "fixed", warning };
}

function idOf(brief: Brief, kind: string): string | null {
  return brief.findings.find((f) => f.kind === kind)?.id ?? null;
}

function templateNote(brief: Brief): Written["note"] {
  const ph = (kind: string) => {
    const id = idOf(brief, kind);
    return id ? `{${id}}` : null;
  };
  const join = (parts: (string | null)[]) => parts.filter(Boolean).join(" ");
  const t = (text: string): NoteSection => ({ text, source: "template" });
  return {
    headline: t(
      `Air quality: {BAND}${ph("overall_mean") ? `, mean PM2.5 ${ph("overall_mean")}` : ""}`,
    ),
    summary: t(
      join([
        ph("period") && `Period: ${ph("period")}.`,
        ph("coverage") && `Coverage: ${ph("coverage")}.`,
        ph("band") && `Band used: ${ph("band")}.`,
      ]),
    ),
    hotspots_and_trend: t(
      join([
        ph("hotspot") && `Hotspot: ${ph("hotspot")}.`,
        ph("trend") && `Overall trend: ${ph("trend")}.`,
        ph("hotspot_trend") && `Hotspot station trend: ${ph("hotspot_trend")}.`,
      ]),
    ),
    data_quality: t(
      join([
        ph("gaps") && `Gaps: ${ph("gaps")}.`,
        ph("suspect") && `Unreliable readings: ${ph("suspect")}.`,
        ph("units") && `Units: ${ph("units")}.`,
      ]),
    ),
    what_changed: t(
      brief.comparison
        ? join([
            ph("change_overall") && `Mean PM2.5: ${ph("change_overall")}.`,
            ph("change_band") && `Band: ${ph("change_band")}.`,
            ph("change_hotspot") && `Hotspot: ${ph("change_hotspot")}.`,
            ph("change_quality") && `Data quality: ${ph("change_quality")}.`,
          ])
        : NO_PREVIOUS,
    ),
  };
}

function templateActions(brief: Brief): Action[] {
  const ids = (...kinds: string[]) =>
    kinds.map((k) => idOf(brief, k)).filter((x): x is string => x !== null);
  const hot = ids("hotspot", "overall_mean");
  const quality = ids("gaps", "suspect");
  const band = ids("band");
  const a = (
    title: string,
    detail: string,
    who: string,
    timeframe: Action["timeframe"],
    findingIds: string[],
  ): Action | null => (findingIds.length ? { title, detail, who, timeframe, findingIds } : null);

  const byAudience: Record<Brief["audience"], (Action | null)[]> = {
    ward_officer: [
      a(
        "Share the citizen advisory",
        "Circulate the advisory for the {BAND} band through ward channels, anganwadis and clinics.",
        "Ward office",
        "today",
        band,
      ),
      a(
        "Check the highest-reading area",
        "Send a field team to the hotspot area to look for dust, waste burning and congestion.",
        "Ward environment team",
        "this week",
        hot,
      ),
      a(
        "Fix the data gaps",
        "Check sensors with missing or unreliable readings before relying on this brief.",
        "Ward environment team",
        "this week",
        quality,
      ),
    ],
    housing_society: [
      a(
        "Share the advisory with residents",
        "Post the advisory for the {BAND} band in resident groups and at the gate, with extra notes for elders and children.",
        "Society committee",
        "today",
        band,
      ),
      a(
        "Control dust and burning inside the society",
        "Stop waste and leaf burning on the premises, and sprinkle water on internal roads.",
        "Society committee",
        "this week",
        hot,
      ),
      a(
        "Report problems to the ward office",
        "Send this brief to the ward office, including the data gaps and unreliable readings.",
        "Society committee",
        "this week",
        quality,
      ),
    ],
    school: [
      a(
        "Plan outdoor activity around the band",
        "For the {BAND} band, keep outdoor sport and assembly short, or move them indoors as the advisory says.",
        "School management",
        "today",
        band,
      ),
      a(
        "Support children who are sensitive to poor air",
        "Make sure children with asthma can reach their inhalers and tell parents about the advisory.",
        "School management",
        "today",
        band,
      ),
      a(
        "Report problems to the ward office",
        "Share this brief with the ward office, including data gaps and the hotspot.",
        "School management",
        "this week",
        [...hot, ...quality],
      ),
    ],
  };
  return byAudience[brief.audience].filter((x): x is Action => x !== null);
}

function fallbackWritten(brief: Brief, llm: LlmConfig, reason: string): Written {
  const warning = `Fixed English guidance is shown because ${reason}.`;
  return {
    status: "fallback",
    model: llm.model,
    note: templateNote(brief),
    actions: templateActions(brief),
    actionsSource: "template",
    advisory: {
      en: { simple: fixed(brief, warning), standard: fixed(brief, warning) },
      hi: { simple: fixed(brief, warning), standard: fixed(brief, warning) },
    },
    warnings: [reason],
  };
}

function toVariant(v: AdvisoryText): AdvisoryVariant {
  return { ...v, source: "model" };
}

export async function writeBrief(
  brief: Brief,
  llm: LlmConfig,
): Promise<{ written: Written; error: string | null }> {
  let reply: Reply;
  try {
    reply = await chatJson({
      llm,
      purpose: "write",
      system: SYSTEM,
      user: buildUser(brief),
      schema: WriteReply,
      timeoutMs: WRITE_TIMEOUT_MS,
      maxTokens: 8000,
    });
  } catch (e) {
    const msg = `the model could not write the brief (${(e as Error).message})`;
    return { written: fallbackWritten(brief, llm, msg), error: msg };
  }

  const ctx: Ctx = {
    ids: new Set(brief.findings.map((f) => f.id)),
    names: brief.stations.map((s) => s.name),
  };
  const warnings: string[] = [];
  const template = templateNote(brief);

  const section = (key: keyof Written["note"]): NoteSection => {
    if (key === "what_changed" && !brief.comparison)
      return { text: NO_PREVIOUS, source: "template" };
    const c = checkText(reply.note[key], ctx, true);
    if (c.ok) return { text: reply.note[key], source: "model" };
    warnings.push(`Note section "${key}" was replaced with code text: ${c.reason}.`);
    return template[key];
  };
  const note: Written["note"] = {
    headline: section("headline"),
    summary: section("summary"),
    hotspots_and_trend: section("hotspots_and_trend"),
    data_quality: section("data_quality"),
    what_changed: section("what_changed"),
  };

  const actions: Action[] = [];
  for (const a of reply.actions) {
    const findingIds = a.finding_ids
      .map((s) => s.replace(/[{}\s]/g, ""))
      .filter((id) => ctx.ids.has(id));
    if (!findingIds.length) {
      warnings.push(`Dropped the action "${a.title}" because it cited no real finding.`);
      continue;
    }
    const bad = [a.title, a.detail, a.who].map((t) => checkText(t, ctx, true)).find((c) => !c.ok);
    if (bad && !bad.ok) {
      warnings.push(`Dropped the action "${a.title}": ${bad.reason}.`);
      continue;
    }
    actions.push({
      title: a.title,
      detail: a.detail,
      who: a.who,
      timeframe: a.timeframe,
      findingIds,
    });
  }
  const useTemplateActions = actions.length < 2;
  if (useTemplateActions)
    warnings.push("Too few valid actions came back, so code-written actions are shown.");

  const en = {} as Written["advisory"]["en"];
  const hi = {} as Written["advisory"]["hi"];
  const instead = "Fixed English guidance is shown instead.";
  for (const level of ["simple", "standard"] as const) {
    const enCheck = checkVariant(reply.advisory.en[level], level, "en", ctx);
    const hiCheck = checkVariant(reply.advisory.hi[level], level, "hi", ctx);
    if (!enCheck.ok) {
      warnings.push(`English ${level} advisory failed a check (${enCheck.reason}).`);
      en[level] = fixed(
        brief,
        `The English ${level} advisory failed an automatic check (${enCheck.reason}). ${instead}`,
      );
      hi[level] = fixed(
        brief,
        `The English ${level} advisory failed a check, so the Hindi version could not be verified. ${instead}`,
      );
    } else if (!hiCheck.ok) {
      warnings.push(`Hindi ${level} advisory failed a check (${hiCheck.reason}).`);
      en[level] = toVariant(reply.advisory.en[level]);
      hi[level] = fixed(
        brief,
        `The Hindi ${level} advisory failed an automatic check (${hiCheck.reason}). ${instead}`,
      );
    } else if (enCheck.tokens !== hiCheck.tokens) {
      warnings.push(`Hindi ${level} advisory used different placeholders from the English one.`);
      en[level] = toVariant(reply.advisory.en[level]);
      hi[level] = fixed(
        brief,
        `The Hindi ${level} advisory did not carry the same facts as the English one. ${instead}`,
      );
    } else {
      en[level] = toVariant(reply.advisory.en[level]);
      hi[level] = toVariant(reply.advisory.hi[level]);
    }
  }
  const advisory: Written["advisory"] = { en, hi };

  const written: Written = {
    status: warnings.length === 0 ? "model" : "fallback",
    model: llm.model,
    note,
    actions: useTemplateActions ? templateActions(brief) : actions.slice(0, 6),
    actionsSource: useTemplateActions ? "template" : "model",
    advisory,
    warnings,
  };
  return { written, error: null };
}
