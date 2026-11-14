import { Button } from "@project-vayu/ui/components/button";
import { Skeleton } from "@project-vayu/ui/components/skeleton";
import { useCallback, useState } from "react";

import { AUDIENCE_LABEL } from "../../../server/src/brief/bands";
import type { Brief } from "../../../server/src/brief/types";
import {
  ActionsView,
  AdvisoryView,
  BandChip,
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
      requestAnimationFrame(() =>
        document.getElementById(`finding-${id}`)?.scrollIntoView({ block: "center" }),
      );
    },
    [setOpen],
  );

  const { written } = brief;
  const c = brief.coverage;

  return (
    <div className="grid gap-4" aria-live="polite">
      <header className="grid gap-2 border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-medium">
            Brief #{brief.id} for a {AUDIENCE_LABEL[brief.audience].toLowerCase()}
          </h2>
          <BandChip band={brief.band} />
        </div>
        <p className="text-sm text-muted-foreground">
          {brief.label}. Period: {brief.period}.
        </p>
        {brief.sample && (
          <p
            role="note"
            className="border border-yellow-600/60 bg-yellow-500/10 p-2 text-sm font-medium"
          >
            Sample data. Station names are real Bhopal CPCB stations, but every reading is invented.
          </p>
        )}
        <p className="text-sm">
          {c.validPm25} of {c.totalRows} rows had a usable PM2.5 reading. {c.gapRows} rows have gaps
          and {c.suspectRows} rows have readings that were excluded as unreliable.
        </p>
        <p className="text-xs text-muted-foreground">Band source: {brief.bandBasis}</p>
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
          <div className="grid gap-2" role="status" aria-label="Writing the brief">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Section>
      )}

      {!writing && brief.writeError && (
        <div
          role="alert"
          className="grid gap-2 border border-destructive/60 bg-destructive/10 p-3 text-sm"
        >
          <p>
            The model could not write this brief ({brief.writeError}). The statistics above are
            still correct. Fixed English guidance is shown below.
          </p>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={onRetryWrite}>
              Try writing again
            </Button>
          </div>
        </div>
      )}

      {written && written.warnings.length > 0 && !brief.writeError && (
        <details className="border border-orange-600/60 bg-orange-500/10 p-3 text-sm">
          <summary className="cursor-pointer font-medium">
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
        <FindingsList brief={brief} openIds={openIds} setOpen={setOpen} />
      </Section>
    </div>
  );
}
