import { ENV } from "./env.server";
import { openStore } from "./store";

export const store = openStore(ENV.DATABASE_URL);
