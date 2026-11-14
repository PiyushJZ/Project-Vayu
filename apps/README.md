# apps

## Overview

The two applications of the Civic Air Quality Briefing Studio, deployed together as one Cloudflare Worker. The server parses pasted air quality tables, computes every figure in code, and stores briefs in Cloudflare D1. The web app is the Vite + React + TanStack Router front end; the Worker serves its built files and answers its calls under `/api`.

## Subdirectories & Boundaries

- server: [./server/README.md](./server/README.md) - Hono API on Cloudflare Workers (port 8080 in development) with the table/analysis/LLM pipeline and D1 store.
- web: [./web/README.md](./web/README.md) - Vite + React front end on port 3000 in development that calls `/api` via `src/lib/api.ts`.
