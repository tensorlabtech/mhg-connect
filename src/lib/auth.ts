import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { runtimeEnv } from "@/lib/runtime-env";

if (
  runtimeEnv.nodeEnv === "production" &&
  !runtimeEnv.isProductionBuild &&
  (!runtimeEnv.authSecret || !runtimeEnv.authUrl)
) {
  throw new Error(
    "BETTER_AUTH_SECRET and BETTER_AUTH_URL are required in the production runtime.",
  );
}

export const auth = betterAuth({
  appName: "MHG Connect",
  baseURL: runtimeEnv.authUrl,
  trustedOrigins: runtimeEnv.authBranchUrl ? [runtimeEnv.authBranchUrl] : [],
  secret: runtimeEnv.authSecret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        defaultValue: "user",
        input: false,
        required: false,
      },
    },
  },
  rateLimit: {
    enabled: runtimeEnv.nodeEnv === "production",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 12 },
      "/sign-up/email": { window: 60, max: 8 },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
