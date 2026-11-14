import { Button } from "@project-vayu/ui/components/button";
import { Textarea } from "@project-vayu/ui/components/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AUDIENCE_LABEL } from "../../../server/src/brief/bands";
import { AUDIENCES, type Audience, type Brief } from "../../../server/src/brief/types";
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
    <div className="container mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <section className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Civic Air Quality Briefing Studio</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Paste a table of air quality readings, even a messy one. Code works out the averages,
            gaps and hotspots and links each finding to its rows. The model then writes the actions,
            a briefing note and a citizen advisory in English and Hindi.
          </p>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium">Who is asking?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {AUDIENCES.map((a) => (
              <Button
                key={a}
                type="button"
                variant={audience === a ? "default" : "outline"}
                aria-pressed={audience === a}
                onClick={() => setAudience(a)}
                disabled={busy}
                className="h-auto flex-col items-start gap-0.5 whitespace-normal px-3 py-2 text-left"
              >
                <span className="text-sm font-medium">{AUDIENCE_LABEL[a]}</span>
                <span className="text-xs font-normal opacity-80">{AUDIENCE_HELP[a]}</span>
              </Button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label htmlFor="table" className="text-sm font-medium">
            Air quality table
          </label>
          <Textarea
            id="table"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            rows={10}
            spellCheck={false}
            placeholder="Paste CSV, tab-separated or semicolon-separated rows with a header line. The columns can be in any order."
            className="max-h-80 min-h-40 overflow-auto font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            {samples.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setText(s.text)}
              >
                Load {s.label}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground">
              Sample tables use real Bhopal CPCB station names with invented readings. Run A, then
              B, to see what changed.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="lg" onClick={generate} disabled={busy || text.trim() === ""}>
            {phase === "analysing"
              ? "Reading the table..."
              : phase === "writing"
                ? "Writing the brief..."
                : "Generate brief"}
          </Button>
          <span role="status" className="text-sm text-muted-foreground">
            {phase === "analysing" && "Matching columns and computing statistics."}
            {phase === "writing" && "Statistics are ready below. The model is writing the text."}
          </span>
        </div>

        {error && (
          <p role="alert" className="border border-destructive/60 bg-destructive/10 p-3 text-sm">
            {error}
          </p>
        )}
      </section>

      <div ref={resultRef} className="scroll-mt-4">
        {brief && (
          <BriefView
            brief={brief}
            writing={phase === "writing"}
            onRetryWrite={() => write(brief.id)}
          />
        )}
      </div>
    </div>
  );
}
