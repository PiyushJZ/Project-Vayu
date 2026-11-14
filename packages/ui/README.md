# @project-vayu/ui Blueprint

## System Overview
Private shared shadcn/ui package (`package.json` name `@project-vayu/ui`, `"private": true`, `"type": "module"`). It has no direct source files at the package root; all code lives under `src`. `components.json` configures shadcn (`style: "base-lyra"`, `iconLibrary: "lucide"`, `tailwind.css: "src/styles/globals.css"`). `tsconfig.json` extends `@project-vayu/config/tsconfig.base.json`, maps `@project-vayu/ui/*` to `./src/*`, and includes `src/**/*.ts(x)`.

## Subdirectories & System Boundaries
- src: [./src/README.md](./src/README.md) - components, lib helpers, and the global stylesheet.

## Global Invariants
- Public entry points are only those in `package.json` `exports`: `./globals.css` -> `./src/styles/globals.css`, `./lib/*` -> `./src/lib/*.ts`, `./components/*` -> `./src/components/*.tsx`.
- Type checking is `tsc --noEmit` (`package.json` script `check-types`).

## Global Side Effects
- None at runtime in package code; `globals.css` scans consumer sources via `@source "../../../apps/**/*.{ts,tsx}"` so Tailwind generates classes used in `apps/`.

## System Verification
- Run: `pnpm --filter @project-vayu/ui check-types`
