import { Button } from "@project-vayu/ui/components/button";
import { Textarea } from "@project-vayu/ui/components/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AUDIENCE_LABEL } from "../../../server/src/brief/bands";
import { AUDIENCES, type Audience, type Brief } from "../../../server/src/brief/types";
import { Callout } from "@/components/brief-parts";
import { BriefView } from "@/components/brief-view";
import { api, type SampleTable } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const AUDIENCE_HELP: Record<Audience, string> = {
  ward_officer: "Ward team: dust control, enforcement, alerts, sensors",
  housing_society: "Society committee: premises, residents, reporting",
  school: "School: sport, timings, children with asthma",
};

type Phase = "idle" | "analysing" | "writing";

function HomeComponent() {
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Audience>("ward_officer");
  const [samples, setSamples] = useState<SampleTable[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .samples()
      .then(setSamples)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function write(id: number) {
    setPhase("writing");
    try {
      setBrief(await api.writeBrief(id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPhase("idle");
    }
  }

  async function generate() {
    setError(null);
    setBrief(null);
    setPhase("analysing");
    let created: Brief;
    try {
      created = await api.createBrief(text, audience);
    } catch (e) {
      setError((e as Error).message);
      setPhase("idle");
      return;
    }
    setBrief(created);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "start" }));
    await write(created.id);
  }

  const busy = phase !== "idle";

  return (
    <>
      <section
        aria-labelledby="studio-title"
        className={`wrap grid content-start gap-x-6 gap-y-10 pt-10 pb-12 sm:pt-12 lg:grid-cols-12 lg:pb-16 ${
          // With a brief on the page the studio keeps the first screen, so the brief starts on a screen of its own.
          brief ? "lg:min-h-[calc(100svh-var(--nav))]" : "flex-1"
        }`}
      >
        <div className="grid content-start gap-8 lg:col-span-6 xl:col-span-5">
          <div className="grid gap-5">
            <h1 id="studio-title" className="enter-rise t-h1">
              Civic Air Quality Briefing Studio
            </h1>
            <p className="enter-rise measure t-lead [--enter-step:1]">
              Paste a table of air quality readings, even a messy one. Code works out the averages,
              gaps and hotspots and links each finding to its rows. The model then writes the
              actions, a briefing note and a citizen advisory in English and Hindi.
            </p>
          </div>

          <fieldset className="enter-rise [--enter-step:2]">
            <legend className="mb-3 t-label">Who is asking?</legend>
            <div className="grid gap-2 sm:max-lg:grid-cols-3">
              {AUDIENCES.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={audience === a}
                  onClick={() => setAudience(a)}
                  disabled={busy}
                  className="group grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-lg border border-border-strong px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-[120ms] ease-ui hover:border-[color-mix(in_oklab,var(--foreground)_36%,transparent)] hover:bg-accent hover:duration-150 disabled:pointer-events-none disabled:opacity-60 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:shadow-[inset_0_0_0_1px_var(--primary)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 grid size-4 place-items-center rounded-full border border-border-strong group-aria-pressed:border-primary"
                  >
                    <span className="size-2 scale-0 rounded-full bg-primary transition-[scale] duration-150 ease-ui group-aria-pressed:scale-100 motion-reduce:transition-none" />
                  </span>
                  <span className="grid gap-0.5">
                    <span className="font-medium">{AUDIENCE_LABEL[a]}</span>
                    <span className="t-small text-muted-foreground">{AUDIENCE_HELP[a]}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="enter-settle grid min-w-0 content-start gap-4 rounded-xl border bg-card p-4 sm:p-6 lg:col-span-6 xl:col-start-7">
          <label htmlFor="table" className="t-label">
            Air quality table
          </label>
          <Textarea
            id="table"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            rows={10}
            wrap="off"
            spellCheck={false}
            placeholder="Paste CSV, tab-separated or semicolon-separated rows with a header line. The columns can be in any order."
            className="h-56 overflow-auto lg:h-[clamp(13rem,38svh,24rem)] font-mono text-[0.8125rem]/[1.7] placeholder:font-sans placeholder:text-base placeholder:whitespace-normal"
          />
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => setText(s.text)}
                  className="max-sm:h-auto max-sm:min-h-11 max-sm:py-2 max-sm:text-left max-sm:whitespace-normal"
                >
                  Load {s.label}
                </Button>
              ))}
            </div>
            <p className="t-small text-muted-foreground">
              Sample tables use real Bhopal CPCB station names with invented readings. Run A, then
              B, to see what changed.
            </p>
          </div>

          {error && (
            <Callout tone="error" role="alert">
              {error}
            </Callout>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-2">
            <Button
              type="button"
              size="lg"
              onClick={generate}
              disabled={busy || text.trim() === ""}
              className="max-sm:w-full"
            >
              {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
              {phase === "analysing"
                ? "Reading the table…"
                : phase === "writing"
                  ? "Writing the brief…"
                  : "Generate brief"}
              {!busy && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="size-3! fill-none stroke-current stroke-[1.6] transition-[translate] duration-[120ms] ease-ui [stroke-linecap:round] [stroke-linejoin:round] group-hover/button:translate-x-[3px] group-hover/button:duration-150 motion-reduce:translate-none!"
                >
                  <path d="M1.5 6h8.5M6.5 2.5 10 6l-3.5 3.5" />
                </svg>
              )}
            </Button>
            <span role="status" className="t-small text-muted-foreground">
              {phase === "analysing" && "Matching columns and computing statistics."}
              {phase === "writing" && "Statistics are ready below. The model is writing the text."}
            </span>
          </div>
        </div>
      </section>

      <div ref={resultRef}>
        {brief && (
          <BriefView
            brief={brief}
            writing={phase === "writing"}
            onRetryWrite={() => write(brief.id)}
          />
        )}
      </div>
    </>
  );
}
