import { initLogger } from "evlog";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono } from "hono";

import { UserError } from "./brief/pipeline";
import { briefRoutes } from "./routes/briefs";
import type { Env } from "./services";

initLogger({
  env: { service: "project-vayu-server" },
});

/** Everything is under /api, so one Worker can serve the web app's files on every other path. */
const app = new Hono<{ Bindings: Env } & EvlogVariables>().basePath("/api");

app.use(evlog());

app.get("/health", (c) => c.text("OK"));
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
