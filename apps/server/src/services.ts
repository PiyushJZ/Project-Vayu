import type { LlmConfig } from "./brief/llm";
import { type SqlDatabase, type Store, openStore } from "./store";

/** The part of Cloudflare's rate limiting binding that the Worker uses. */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** The Worker's bindings: `DB` and the `vars` come from `wrangler.jsonc`, the key is a secret. */
export interface Env {
  DB: SqlDatabase;
  BRIEF_RATE_LIMIT?: RateLimiter;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL: string;
  OPENROUTER_BASE_URL: string;
  /** Set by the deploy workflow from repository variables; see "Access" in README.md. */
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
}

/** Everything the brief pipeline needs from outside. Built per request, so no state is shared between requests. */
export interface Services {
  store: Store;
  llm: LlmConfig;
}

export function servicesFor(env: Env): Services {
  return {
    store: openStore(env.DB),
    llm: {
      apiKey: env.OPENROUTER_API_KEY || undefined,
      model: env.OPENROUTER_MODEL,
      baseUrl: env.OPENROUTER_BASE_URL.replace(/\/+$/, ""),
    },
  };
}
