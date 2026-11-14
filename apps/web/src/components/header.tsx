import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

/** The Vayu logo, served from `public/` so the header, favicon and any other page use one file. */
function Mark() {
  return (
    <img src="/vayu-logo.svg" alt="" width={40} height={40} className="-ml-1.5 size-10 shrink-0" />
  );
}

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-(--nav) border-b bg-background">
      <div className="wrap flex h-full items-center justify-between gap-4">
        <a
          href="#main"
          className="sr-only rounded-sm bg-background px-4 py-2 font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:z-50"
        >
          Skip to content
        </a>
        <Link to="/" className="flex min-h-11 items-center gap-2.5 text-xl tracking-[-0.02em]">
          <Mark />
          Vayu
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
