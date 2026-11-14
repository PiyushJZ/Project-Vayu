import { createPrismaClient } from "@project-vayu/db";

import { ENV } from "./env.server";

export const db = createPrismaClient(ENV);
