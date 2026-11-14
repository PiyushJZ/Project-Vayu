# components

## Overview
React UI components for the web app: app chrome (header, theme toggle, loader) and the rendering of a generated air quality `Brief`. Brief and band types and constants are imported from `../../../server/src/brief/{types,bands}` (outside this package).

## Interface
- `brief-view.tsx`: `BriefView({ brief, writing, onRetryWrite })` renders the full brief. It keeps `openIds` state (open finding ids) and a `cite(id)` callback that opens a finding and scrolls to `#finding-<id>`.
- `brief-parts.tsx`: `BandChip`, `Section`, `CopyButton`, `MappingView`, `StationsTable`, `DataIssues`, `ComparisonView`, `ActionsView`, `NoteView`, `AdvisoryView`, `FindingsList`, and `noteText(brief, written)`. Used by `BriefView`.
- `rich-text.tsx`: `type Lang = "en" | "hi"`; `Rich({ text, findings, band, lang, onCite })` replaces `{F<n>}` and `{BAND}` tokens with `Finding.display` or `BANDS[band][lang]` and renders each finding token with a citation button; `resolveText(text, findings, band, lang)` returns the plain-text version (unknown finding ids resolve to `""`).
- `header.tsx`: default export `Header` renders a TanStack `Link` to `/` and `ModeToggle`.
- `mode-toggle.tsx`: `ModeToggle` dropdown that calls `setTheme("light" | "dark" | "system")`.
- `theme-provider.tsx`: `ThemeProvider` (wraps `next-themes` `ThemeProvider`) and re-exported `useTheme`.
- `loader.tsx`: default export `Loader`, a spinning `Loader2` icon.

## Invariants
- `rich-text.tsx:Rich`: a `{F<n>}` token whose id is not in `findings` renders `null`; `{BAND}` renders `BANDS[band][lang]` in `<strong>`.
- `brief-view.tsx:BriefView`: the actions, note and advisory sections render only when `brief.written` is set; the error block renders only when `!writing && brief.writeError`; the warnings block renders only when `written.warnings.length > 0 && !brief.writeError`.
- `brief-view.tsx:setOpen` returns the previous state unchanged when the open state already matches (avoids redundant re-renders).
- `brief-parts.tsx:SourceRows` shows at most `limit` (default 40) row ids.

## Side Effects
- `brief-parts.tsx:CopyButton` calls `navigator.clipboard.writeText(text)`, sets "Copied" for 1500 ms via `setTimeout`, and swallows clipboard errors.
- `brief-view.tsx:cite` calls `requestAnimationFrame` and `document.getElementById(...).scrollIntoView`.
- `mode-toggle.tsx` and `theme-provider.tsx` change the theme through `next-themes` (which persists it per the `storageKey` set in `../routes/__root.tsx`).

## Verification
- Run: `pnpm --filter web check-types` (runs `vite build && tsc --noEmit`, so it writes `dist/`; no test runner is configured in `apps/web/package.json`).
