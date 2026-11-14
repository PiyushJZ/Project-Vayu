import { Hono } from "hono";
import { z } from "zod";

import { createBrief, writeForBrief } from "../brief/pipeline";
import { SAMPLES } from "../brief/samples";
import { AUDIENCES } from "../brief/types";
import { type Env, servicesFor } from "../services";

const CreateBody = z.object({
  text: z.string().min(1).max(300_000),
  audience: z.enum(AUDIENCES),
});
const IdParams = z.object({ id: z.coerce.number().int().positive() });

export const briefRoutes = new Hono<{ Bindings: Env }>()
  .get("/samples", (c) => c.json(SAMPLES))

  .post("/briefs", async (c) => {
    const body = CreateBody.safeParse(await c.req.json().catch(() => null));
    if (!body.success) {
      return c.json({ error: "Send the table text and choose who the brief is for." }, 400);
    }
    return c.json(await createBrief(servicesFor(c.env), body.data));
  })

  .post("/briefs/:id/write", async (c) => {
    const params = IdParams.safeParse(c.req.param());
    if (!params.success) return c.json({ error: "Invalid brief id." }, 400);
    return c.json(await writeForBrief(servicesFor(c.env), params.data.id));
  });
