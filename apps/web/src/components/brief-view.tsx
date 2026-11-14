import { Button } from "@project-vayu/ui/components/button";
import { Card, CardContent } from "@project-vayu/ui/components/card";
import { Skeleton } from "@project-vayu/ui/components/skeleton";
import { useCallback, useState } from "react";

import { AUDIENCE_LABEL } from "../../../server/src/brief/bands";
import type { Brief } from "../../../server/src/brief/types";
import {
  ActionsView,
  AdvisoryView,
  BandScale,
  Callout,
  ComparisonView,
  CopyButton,
  DataIssues,
  FindingsList,
  MappingView,
  NoteView,
  Section,
  StationsTable,
  noteText,
} from "./brief-parts";

export function BriefView({
  brief,
  writing,
  onRetryWrite,
}: {
  brief: Brief;
  writing: boolean;
  onRetryWrite: () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [citedId, setCitedId] = useState<string | null>(null);

  const setOpen = useCallback((id: string, open: boolean) => {
    setOpenIds((prev) => {
      if (prev.has(id) === open) return prev;
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const cite = useCallback(
    (id: string) => {
      setOpen(id, true);
      setCitedId(id);
      requestAnimationFrame(() =>
        document.getElementById(`finding-${id}`)?.scrollIntoView({ block: "center" }),
      );
    },
    [setOpen],
  );

  const { written } = brief;
  const c = brief.coverage;

  return (
    <div className="wrap grid grid-cols-1 gap-14 pt-6 pb-20 lg:gap-20 lg:pb-28" aria-live="polite">
      <header className="grid grid-cols-1 gap-6">
        <div className="grid gap-x-6 gap-y-6 xl:grid-cols-12">
          <div className="grid content-start gap-4 xl:col-span-5">
            <h2 className="t-h2">
              Brief #{brief.id} for a {AUDIENCE_LABEL[brief.audience].toLowerCase()}
            </h2>
            <p className="text-muted-foreground">
              {brief.label}. Period: {brief.period}.
            </p>
            <p>
              {c.validPm25} of {c.totalRows} rows had a usable PM2.5 reading. {c.gapRows} rows have
              gaps and {c.suspectRows} rows have readings that were excluded as unreliable.
            </p>
            {brief.sample && (
              <Callout role="note" className="t-small font-medium">
                Sample data. Station names are real Bhopal CPCB stations, but every reading is
                invented.
              </Callout>
            )}
          </div>
          <div className="xl:col-span-6 xl:col-start-7">
            <BandScale brief={brief} />
          </div>
        </div>
        <MappingView brief={brief} />
      </header>

      <Section
        title="Stations and likely hotspot"
        description="Every figure is computed by code from the rows you pasted. A hotspot is the station with the highest mean, not a located pollution source."
      >
        <StationsTable brief={brief} />
      </Section>

      <Section
        title="Data gaps and unreliable readings"
        description="These rows are flagged so nobody reads more into the data than it supports."
      >
        <DataIssues brief={brief} />
      </Section>

      <Section title="What changed since the last brief">
        <ComparisonView brief={brief} />
      </Section>

      {writing && !written && (
        <Section
          title="Writing the brief"
          description="The statistics above are final. The model is now writing the actions, the briefing note and the advisory in English and Hindi. This can take a minute or two."
        >
          <Card>
            <CardContent className="grid gap-3" role="status" aria-label="Writing the brief">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </Section>
      )}

      {!writing && brief.writeError && (
        <Callout tone="error" role="alert" className="grid gap-3">
          <p className="measure">
            {/* writeError already reads "the model could not write the brief (reason)". */}
            {brief.writeError.charAt(0).toUpperCase() + brief.writeError.slice(1)}. The statistics
            above are still correct. Fixed English guidance is shown below.
          </p>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={onRetryWrite}>
              Try writing again
            </Button>
          </div>
        </Callout>
      )}

      {written && written.warnings.length > 0 && !brief.writeError && (
        <details className="group rounded-lg border border-caution/45 bg-caution/10 px-4 py-3">
          <summary className="flex list-none items-center gap-3 font-medium">
            {written.warnings.length} part{written.warnings.length === 1 ? "" : "s"} of the model's
            text failed a check and were replaced
          </summary>
          <ul className="mt-2 list-disc pl-5">
            {written.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}

      {written && (
        <>
          <Section
            title="Priority actions"
            description={`Ranked for a ${AUDIENCE_LABEL[brief.audience].toLowerCase()}. Each action cites the findings it rests on.`}
          >
            <ActionsView brief={brief} written={written} cite={cite} />
          </Section>

          <Section
            title="Internal briefing note"
            action={<CopyButton text={noteText(brief, written)} label="Copy note" />}
          >
            <NoteView brief={brief} written={written} cite={cite} />
          </Section>

          <Section
            title="Citizen advisory"
            description="Written for the public, with separate guidance for children, older adults and people sensitive to poor air."
          >
            <AdvisoryView brief={brief} written={written} cite={cite} />
          </Section>
        </>
      )}

      <Section
        id="findings"
        title="Findings and their source rows"
        description="Select a finding to see the exact rows of your table it was computed from. Figures in the text above link here."
      >
        <FindingsList brief={brief} openIds={openIds} setOpen={setOpen} citedId={citedId} />
      </Section>
    </div>
  );
}
