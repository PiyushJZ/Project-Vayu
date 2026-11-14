import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { sign } from "hono/jwt";

import app from "./index";
import type { Env, RateLimiter } from "./services";

const TEAM = "vayu-test.cloudflareaccess.com";
const AUD = "test-aud";
const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

async function keyPair() {
  const pair = (await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )) as { publicKey: CryptoKey; privateKey: CryptoKey };
  const publicJwk = {
    ...(await crypto.subtle.exportKey("jwk", pair.publicKey)),
    kid: "k1",
    alg: "RS256",
  };
  const privateJwk = {
    ...(await crypto.subtle.exportKey("jwk", pair.privateKey)),
    kid: "k1",
    alg: "RS256",
  };
  return { publicJwk, privateJwk };
}

const { publicJwk, privateJwk } = await keyPair();

function serveCerts() {
  globalThis.fetch = (async (input: string | URL | Request) => {
    assert.equal(String(input), `https://${TEAM}/cdn-cgi/access/certs`);
    return Response.json({ keys: [publicJwk] });
  }) as typeof fetch;
}

const token = (claims: Record<string, unknown> = {}) =>
  sign(
    {
      iss: `https://${TEAM}`,
      aud: [AUD],
      email: "officer@example.com",
      exp: Math.floor(Date.now() / 1000) + 300,
      ...claims,
    },
    privateJwk,
    "RS256",
  );

function env(extra: Partial<Env> = {}): Env {
  return {
    // The requests below never reach the store.
    DB: undefined as unknown as Env["DB"],
    OPENROUTER_MODEL: "stub",
    OPENROUTER_BASE_URL: "http://127.0.0.1:1",
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    ...extra,
  };
}

// A body the route rejects with 400, so a request that gets past the middleware is easy to tell apart.
const post = (headers: Record<string, string>, e: Env) =>
  app.request(
    "/api/briefs",
    { method: "POST", body: "{}", headers: { "Content-Type": "application/json", ...headers } },
    e,
  );

describe("Cloudflare Access check", () => {
  it("refuses a request with no Access token", async () => {
    const res = await post({}, env());
    assert.equal(res.status, 401);
  });

  it("lets a correctly signed token through", async () => {
    serveCerts();
    const res = await post({ "Cf-Access-Jwt-Assertion": await token() }, env());
    assert.equal(res.status, 400);
  });

  it("refuses a token for another application", async () => {
    serveCerts();
    const res = await post({ "Cf-Access-Jwt-Assertion": await token({ aud: ["other"] }) }, env());
    assert.equal(res.status, 403);
  });

  it("refuses an expired token", async () => {
    serveCerts();
    const exp = Math.floor(Date.now() / 1000) - 60;
    const res = await post({ "Cf-Access-Jwt-Assertion": await token({ exp }) }, env());
    assert.equal(res.status, 403);
  });

  it("is off when Access is not configured, and health stays open", async () => {
    const off = env({ ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined });
    assert.equal((await post({}, off)).status, 400);
    assert.equal((await app.request("/api/health", {}, env())).status, 200);
  });
});

describe("rate limit and headers", () => {
  it("answers 429 once the limiter says no, keyed on the signed-in user", async () => {
    serveCerts();
    const keys: string[] = [];
    const limiter: RateLimiter = {
      limit: async ({ key }) => {
        keys.push(key);
        return { success: false };
      },
    };
    const res = await post(
      { "Cf-Access-Jwt-Assertion": await token() },
      env({ BRIEF_RATE_LIMIT: limiter }),
    );
    assert.equal(res.status, 429);
    assert.deepEqual(keys, ["officer@example.com"]);
  });

  it("stops an oversized body with 413 and sets security headers", async () => {
    const off = env({ ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined });
    const res = await post({ "Content-Length": String(2 * 1024 * 1024) }, off);
    assert.equal(res.status, 413);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(res.headers.get("cache-control"), "no-store");
  });
});
