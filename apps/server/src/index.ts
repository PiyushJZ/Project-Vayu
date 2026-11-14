import fastifyCors from "@fastify/cors";
import { initLogger } from "evlog";
import { evlog } from "evlog/fastify";
import { createFsDrain } from "evlog/fs";
import Fastify from "fastify";

import { ENV } from "./env.server";

const baseCorsConfig = {
  origin: ENV.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

initLogger({
  env: { service: "project-vayu-server" },
});

const fastify = Fastify({
  logger: true,
});

fastify.register(evlog, {
  drain: process.env.NODE_ENV === "production" ? undefined : createFsDrain(),
});
fastify.register(fastifyCors, baseCorsConfig);

fastify.get("/", async () => {
  return "OK";
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server running on port 3000");
});
