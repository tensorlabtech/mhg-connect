import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { runtimeEnv } from "@/lib/runtime-env";

if (
  runtimeEnv.nodeEnv === "production" &&
  !runtimeEnv.isProductionBuild &&
  !runtimeEnv.databaseUrl
) {
  throw new Error("DATABASE_URL is required in the production runtime.");
}

const client = runtimeEnv.databaseUrl
  ? postgres(runtimeEnv.databaseUrl, { max: 5, prepare: false })
  : postgres({ max: 1, prepare: false });

export const db = drizzle({ client, schema });
export type Database = typeof db;

export async function closeDatabase() {
  await client.end();
}
