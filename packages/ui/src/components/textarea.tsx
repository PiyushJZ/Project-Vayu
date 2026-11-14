import { cn } from "@project-vayu/ui/lib/utils";
import * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-sm border border-input bg-background px-3 py-3 text-base text-foreground transition-[border-color] duration-[140ms] ease-ui placeholder:text-muted-foreground focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-2 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
