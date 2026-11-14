import type { MiddlewareHandler } from "hono";
import { verifyWithJwks } from "hono/jwt";

import type { Env } from "./services";

type Jwk = NonNullable<Parameters<typeof verifyWithJwks>[1]["keys"]>[number];

/** Signing keys per team domain. Refetched hourly, or at once when a token names a key not seen yet (rotation). */
const certs = new Map<string, { keys: Jwk[]; fetchedAt: number }>();
const CERTS_TTL_MS = 60 * 60 * 1000;

async function keysFor(team: string, refresh: boolean): Promise<Jwk[]> {
  const cached = certs.get(team);
  if (cached && !refresh && Date.now() - cached.fetchedAt < CERTS_TTL_MS) return cached.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs returned ${res.status}`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  certs.set(team, { keys, fetchedAt: Date.now() });
  return keys;
}

async function verifyAccessToken(token: string, team: string, aud: string) {
  const verify = (keys: Jwk[]) =>
    verifyWithJwks(token, {
      keys,
      allowedAlgorithms: ["RS256"],
      verification: { iss: `https://${team}`, aud },
    });
  try {
    return await verify(await keysFor(team, false));
  } catch {
    return verify(await keysFor(team, true));
  }
}

export type AccessVariables = { accessUser?: string };

/**
 * The shared workspace sits behind Cloudflare Access. Access signs every request it lets through,
 * and this re-checks that signature, so a route that bypasses Access is still refused.
 * Off when ACCESS_TEAM_DOMAIN and ACCESS_AUD are unset (local dev and the browser tests).
 */
export const requireAccess: MiddlewareHandler<{
  Bindings: Env;
  Variables: AccessVariables;
}> = async (c, next) => {
  const team = c.env.ACCESS_TEAM_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const aud = c.env.ACCESS_AUD;
  if (!team || !aud) return next();

  const token = c.req.header("cf-access-jwt-assertion");
  if (!token) return c.json({ error: "Sign in through Cloudflare Access to use Vayu." }, 401);
  try {
    const payload = await verifyAccessToken(token, team, aud);
    const user = payload.email ?? payload.common_name;
    c.set("accessUser", typeof user === "string" ? user : undefined);
  } catch {
    return c.json(
      { error: "Your sign-in could not be verified. Reload the page to sign in again." },
      403,
    );
  }
  return next();
};

/** Caps model-calling requests per signed-in user, or per address when Access is off. */
export const rateLimit: MiddlewareHandler<{
  Bindings: Env;
  Variables: AccessVariables;
}> = async (c, next) => {
  const limiter = c.env.BRIEF_RATE_LIMIT;
  if (!limiter || c.req.method !== "POST") return next();
  const key = c.get("accessUser") ?? c.req.header("cf-connecting-ip") ?? "unknown";
  const { success } = await limiter.limit({ key });
  if (!success) {
    return c.json(
      { error: "Too many briefs in the last minute. Wait a minute and try again." },
      429,
    );
  }
  return next();
};
