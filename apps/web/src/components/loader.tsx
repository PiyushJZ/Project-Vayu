import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div role="status" className="flex h-full items-center justify-center gap-2 pt-8">
      <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
      <span className="t-small text-muted-foreground">Loading the studio…</span>
    </div>
  );
}
