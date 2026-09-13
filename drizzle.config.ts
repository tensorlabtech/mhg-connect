import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const databaseUrl = globalThis.process?.["env"]?.["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for database commands.");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
