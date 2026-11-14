import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

/** Three matching readings and one that differs: the studio's job in four shapes. */
function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <circle cx="17.5" cy="6.5" r="4.5" />
      <circle cx="6.5" cy="17.5" r="4.5" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" className="fill-primary" />
    </svg>
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
          Briefing Studio
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
