# project-vayu

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Fastify, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Fastify** - Fast, low-overhead web framework
- **Node.js** - Runtime environment
- **SQLite** - Database engine, used through Node's built-in `node:sqlite`
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)

## Civic Air Quality Briefing Studio

Paste a messy air quality table, choose who is asking (ward officer, housing society or school), and get a brief.

- Code parses the table and computes every number: means, gaps, unreliable readings, trend, hotspot, the CPCB PM2.5 band, and the change since the previous brief. Each finding links to the rows it came from.
- The model (OpenRouter) is called twice. First it maps the table's columns and units. Then it writes ranked actions, an internal briefing note and a citizen advisory in English and Hindi at two reading levels. It refers to figures only by finding id, and code rejects any number it types itself. Text that fails a check is replaced by labelled code-written text.
- Hindi is machine-translated and is always labelled "review before publishing".
- Briefs are stored as JSON in SQLite through `node:sqlite` (Node 22.5 or later). The database file is created on first run at the path in `DATABASE_URL`, so there is no database setup step.

Setup: put `OPENROUTER_API_KEY` in `apps/server/.env`. `OPENROUTER_MODEL` defaults to `openrouter/auto`, which can pick a different model on each call, so set a fixed model slug for predictable speed and quality. Then run `pnpm run dev`, open http://localhost:3000, load sample A, generate, then load sample B and generate to see the comparison. Run the server tests with `pnpm --filter server test`.

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API is running at [http://localhost:8080](http://localhost:8080).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@project-vayu/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node tools that use Varlock from the owning app directory so they load that app's schema and env files. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Git Hooks and Formatting

- Run checks: `pnpm run check`

## Project Structure

```
project-vayu/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Fastify)
├── packages/
│   └── ui/          # Shared shadcn/ui components and styles
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm --filter server test`: Run the server tests
- `pnpm run check`: Run Oxlint and Oxfmt

## System Overview

A pnpm workspace with two apps and one shared package. `apps/web` (Vite + React) calls `apps/server` (Fastify) over HTTP. The server owns all parsing, arithmetic and storage; the LLM only maps columns and writes text that code then validates. `packages/ui` supplies shared shadcn/ui components and global styles.

## Subdirectories & System Boundaries

- apps: [./apps/README.md](./apps/README.md) - Deployable applications.
  - server: [./apps/server/README.md](./apps/server/README.md) - Fastify API on port 8080, brief pipeline, SQLite store.
  - web: [./apps/web/README.md](./apps/web/README.md) - Front end on port 3000.
- packages: [./packages/README.md](./packages/README.md) - Shared workspace packages.
  - ui: [./packages/ui/README.md](./packages/ui/README.md) - `@project-vayu/ui` components, `cn` helper and `globals.css`.
- `packages/config` has no source code and no contract file.

## Global Invariants

- Every number in a brief is computed by code in `apps/server/src/brief`; LLM text is accepted only after `write.ts:checkText`.
- `apps/server/src/env.ts`, `apps/web/src/env.ts` and `apps/web/src/routeTree.gen.ts` are generated and gitignored; do not edit them by hand.
- The web app reaches the server only through `ENV.VITE_SERVER_URL` in `apps/web/src/lib/api.ts`.

## Global Side Effects

- The server listens on port 8080 and the web dev server on port 3000.
- The server reads and writes a local SQLite file at `DATABASE_URL` and calls the OpenRouter API using `OPENROUTER_API_KEY`.
- Non-production runs write evlog files.

## System Verification

- Run: `pnpm --filter server test`
- Run: `pnpm run check-types`
