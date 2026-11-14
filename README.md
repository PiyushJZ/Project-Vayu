# project-vayu

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Hono, and more. It deploys to Cloudflare Workers.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Small, fast web framework for the API
- **Cloudflare Workers** - One Worker serves the API and the built web app
- **Cloudflare D1** - SQLite database, bound to the Worker
- **Playwright** - Browser tests for the whole product
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)

## Civic Air Quality Briefing Studio

Paste a messy air quality table, choose who is asking (ward officer, housing society or school), and get a brief.

- Code parses the table and computes every number: means, gaps, unreliable readings, trend, hotspot, the CPCB PM2.5 band, and the change since the previous brief. Each finding links to the rows it came from.
- The model (OpenRouter) is called twice. First it maps the table's columns and units. Then it writes ranked actions, an internal briefing note and a citizen advisory in English and Hindi at two reading levels. It refers to figures only by finding id, and code rejects any number it types itself. Text that fails a check is replaced by labelled code-written text.
- Hindi is machine-translated and is always labelled "review before publishing".
- Briefs are stored as JSON in Cloudflare D1. The table is created on first use and the local database is created by `wrangler dev`, so there is no database setup step.
- Without an OpenRouter key the app still works: columns are matched by header words and all text is code-written, with the reason shown.

Setup: put `OPENROUTER_API_KEY=...` in `apps/server/.env`. `OPENROUTER_MODEL` is set in `apps/server/wrangler.jsonc` and defaults to `openrouter/auto`, which can pick a different model on each call, so set a fixed model slug there for predictable speed and quality. Then run `pnpm run dev`, open http://localhost:3000, load sample A, generate, then load sample B and generate to see the comparison.

## Getting Started

Use Node 26 (`.nvmrc`) and pnpm. First, install the dependencies:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API is a Cloudflare Worker run locally by `wrangler dev` at [http://localhost:8080/api](http://localhost:8080/api/health); the web dev server proxies `/api` to it.

To see the app exactly as it is deployed, run `pnpm --filter web build` and open [http://localhost:8080](http://localhost:8080): the Worker serves the built web app and the API from one origin.

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

## Configuration

The web app has no environment variables. The Worker's settings are its bindings, declared in `apps/server/wrangler.jsonc`:

| Name                  | Kind        | Where it is set                                                         |
| --------------------- | ----------- | ----------------------------------------------------------------------- |
| `DB`                  | D1 database | `wrangler.jsonc`. Local data lives in `apps/server/.wrangler/state`.    |
| `OPENROUTER_MODEL`    | variable    | `wrangler.jsonc` (`vars`)                                               |
| `OPENROUTER_BASE_URL` | variable    | `wrangler.jsonc` (`vars`)                                               |
| `OPENROUTER_API_KEY`  | secret      | Locally `apps/server/.env` (gitignored). In production a Worker secret. |

## Testing

- `pnpm test` runs the server's unit tests (parsing, statistics, text checks, the store's SQL).
- `pnpm test:e2e` builds the web app and runs the Playwright browser tests against the Worker in `wrangler dev`, with a stub in place of OpenRouter. No key is needed and your development data is not touched. The first time, install the browser with `pnpm exec playwright install chromium`. See [./e2e/README.md](./e2e/README.md).

`.mcp.json` registers the Playwright MCP server, so a coding agent can drive a browser against the running app.

## Deployment

The whole product is one Cloudflare Worker named `project-vayu`: it serves the built web app, answers the API under `/api`, and stores briefs in a D1 database named `project-vayu`.

Two GitHub Actions workflows live in `.github/workflows`:

- `ci.yml` holds the checks (lint, format check, type check, unit tests, build, browser tests). It has no trigger of its own: `deploy.yml` calls it, so nothing runs on pull requests or other branches.
- `deploy.yml` runs on every push or merge to `main` (and by hand from the Actions tab, which only deploys from `main`): it runs the checks, then deploys and calls `/api/health` on the deployed app.

Everything stays on Cloudflare's free plan and needs no domain: the app is served from its `*.workers.dev` address, with D1 and static assets on the free tier.

One-time setup:

1. In the Cloudflare dashboard, create an API token from the "Edit Cloudflare Workers" template and add the permission "Account > D1 > Edit" to it.
2. In the GitHub repository, under Settings > Secrets and variables > Actions, add these secrets:
   - `CLOUDFLARE_API_TOKEN`: the token from step 1.
   - `CLOUDFLARE_ACCOUNT_ID`: your account id, shown on the Workers overview page.
   - `OPENROUTER_API_KEY`: the OpenRouter key. The workflow stores it as a Worker secret on each deploy. If you leave it out, set it once yourself with `pnpm --filter server exec wrangler secret put OPENROUTER_API_KEY`.
3. Push to `main`. The first deploy creates the D1 database and prints the app's `workers.dev` address.

To deploy from your own machine instead: `pnpm --filter server exec wrangler login`, then `pnpm run deploy`.

## Git Hooks and Formatting

- Run checks: `pnpm run check`

## Project Structure

```
project-vayu/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono on Cloudflare Workers) and the Worker config
├── packages/
│   └── ui/          # Shared shadcn/ui components and styles
├── e2e/             # Playwright browser tests and the OpenRouter stub
└── .github/         # CI and deploy workflows
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build the web app, then bundle the Worker without uploading it
- `pnpm run deploy`: Build the web app and deploy the Worker to Cloudflare
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps and the browser tests
- `pnpm test`: Run the server unit tests
- `pnpm test:e2e`: Build the web app and run the browser tests
- `pnpm run check`: Run Oxlint and Oxfmt

## System Overview

A pnpm workspace with two apps and one shared package. `apps/web` (Vite + React) calls `apps/server` (Hono on Cloudflare Workers) at `/api` on its own origin; the same Worker serves the web app's built files. The server owns all parsing, arithmetic and storage; the LLM only maps columns and writes text that code then validates. `packages/ui` supplies shared shadcn/ui components and global styles.

## Subdirectories & System Boundaries

- apps: [./apps/README.md](./apps/README.md) - Deployable applications.
  - server: [./apps/server/README.md](./apps/server/README.md) - Hono API on Cloudflare Workers (port 8080 in development), brief pipeline, D1 store.
  - web: [./apps/web/README.md](./apps/web/README.md) - Front end on port 3000 in development.
- packages: [./packages/README.md](./packages/README.md) - Shared workspace packages.
  - ui: [./packages/ui/README.md](./packages/ui/README.md) - `@project-vayu/ui` components, `cn` helper and `globals.css`.
- e2e: [./e2e/README.md](./e2e/README.md) - Playwright browser tests and the OpenRouter stub.
- `packages/config` has no source code and no contract file.

## Global Invariants

- Every number in a brief is computed by code in `apps/server/src/brief`; LLM text is accepted only after `write.ts:checkText`.
- `apps/web/src/routeTree.gen.ts` is generated and gitignored; do not edit it by hand.
- The web app reaches the server only at the same-origin path `/api`, in `apps/web/src/lib/api.ts`. Every API route is under `/api`.
- The Worker is configured only through its bindings (`apps/server/src/services.ts:Env`); no code reads `process.env`.

## Global Side Effects

- In development the Worker listens on port 8080 and the web dev server on port 3000. Browser tests use ports 8787 and 8788.
- The server reads and writes the D1 database bound as `DB` and calls the OpenRouter API using `OPENROUTER_API_KEY`.
- Request and model-call logs go to the console (Workers Logs in production).
- A push to `main` deploys to Cloudflare.

## System Verification

- Run: `pnpm test`
- Run: `pnpm run check-types`
- Run: `pnpm run build`
- Run: `pnpm test:e2e`
