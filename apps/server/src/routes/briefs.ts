import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { createBrief, writeForBrief } from "../brief/pipeline";
import { SAMPLES } from "../brief/samples";
import { AUDIENCES } from "../brief/types";
import { store } from "../services";

const CreateBody = z.object({
  text: z.string().min(1).max(300_000),
  audience: z.enum(AUDIENCES),
});
const IdParams = z.object({ id: z.coerce.number().int().positive() });

export async function briefRoutes(app: FastifyInstance) {
  app.get("/samples", async () => SAMPLES);

  app.post("/briefs", async (req, reply) => {
    const body = CreateBody.safeParse(req.body);
    if (!body.success) {
      return reply
        .code(400)
        .send({ error: "Send the table text and choose who the brief is for." });
    }
    return createBrief(store, body.data);
  });

  app.post("/briefs/:id/write", async (req, reply) => {
    const params = IdParams.safeParse(req.params);
    if (!params.success) return reply.code(400).send({ error: "Invalid brief id." });
    return writeForBrief(store, params.data.id);
  });
}
