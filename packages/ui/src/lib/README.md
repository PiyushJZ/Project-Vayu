# lib

## Overview
Shared helper utilities for the UI package, exposed as `@project-vayu/ui/lib/*` (`../../package.json` `exports`).

## Interface
- `utils.ts`: `cn` (re-exported from the `cn` npm package: `export { cn } from "cn"`).

## Invariants
- `cn` is a pure re-export; no local implementation exists in `utils.ts`. Components import it as `@project-vayu/ui/lib/utils` (see `../components/*.tsx`).
- Files resolve at `./src/lib/*.ts` per the `exports` map, so new helpers must be `.ts` (not `.tsx`) to be importable via that subpath.

## Side Effects
- None (`utils.ts` contains only a re-export).

## Verification
- Run: `pnpm --filter @project-vayu/ui check-types`
