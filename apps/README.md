# apps

## Overview
Deployable applications of the Civic Air Quality Briefing Studio. The server parses pasted air quality tables, computes every figure in code, and stores briefs in SQLite. The web app is the Vite + React + TanStack Router front end that calls the server over HTTP.

## Subdirectories & Boundaries
- server: [./server/README.md](./server/README.md) - Fastify API on port 8080 with the table/analysis/LLM pipeline and `node:sqlite` store.
- web: [./web/README.md](./web/README.md) - Vite + React front end on port 3000 that calls the server via `src/lib/api.ts`.
