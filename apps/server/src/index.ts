import { initLogger } from "evlog";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";

import { type AccessVariables, rateLimit, requireAccess } from "./access";
import { UserError } from "./brief/pipeline";
import { briefRoutes } from "./routes/briefs";
import type { Env } from "./services";

initLogger({
  env: { service: "project-vayu-server" },
});

/** Everything is under /api, so one Worker can serve the web app's files on every other path. */
const app = new Hono<{ Bindings: Env; Variables: AccessVariables } & EvlogVariables>().basePath(
  "/api",
);

app.use(evlog());
app.use(
  secureHeaders({
    contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    xFrameOptions: "DENY",
  }),
);
app.use(async (c, next) => {
  await next();
  // Briefs hold the pasted tables, so no shared cache keeps a copy.
  c.header("Cache-Control", "no-store");
});

// Left open so the deploy workflow can check the Worker answers.
app.get("/health", (c) => c.text("OK"));

app.use(requireAccess);
// "/briefs/*" also matches "/briefs". The 300k-character check runs after parsing; this stops a larger body before it is read.
app.use(
  "/briefs/*",
  bodyLimit({
    maxSize: 1536 * 1024,
    onError: (c) => c.json({ error: "The table is too large. Paste a shorter period." }, 413),
  }),
  rateLimit,
);
app.route("/", briefRoutes);

app.notFound((c) => c.json({ error: `No API route for ${c.req.method} ${c.req.path}.` }, 404));

app.onError((err, c) => {
  if (err instanceof UserError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  c.get("log").error(err);
  return c.json({ error: "The server hit an unexpected problem. Try again." }, 500);
});

export default app;
