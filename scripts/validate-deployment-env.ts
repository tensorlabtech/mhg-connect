const runtime = globalThis.process?.["env"] ?? {};
const strict = globalThis.process.argv.includes("--strict");
const shouldValidate = strict || runtime["VERCEL"] === "1";

if (!shouldValidate) {
  console.info("Deployment environment check skipped for local build.");
} else {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "B2_S3_ENDPOINT",
    "B2_REGION",
    "B2_BUCKET_NAME",
    "B2_KEY_ID",
    "B2_APPLICATION_KEY",
  ];
  const missing = required.filter((name) => !runtime[name]);
  if (missing.length) {
    throw new Error(`Missing deployment variables: ${missing.join(", ")}.`);
  }

  if ((runtime["BETTER_AUTH_SECRET"]?.length ?? 0) < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }
  const authUrl = new URL(runtime["BETTER_AUTH_URL"]!);
  if (authUrl.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL must use HTTPS for deployment.");
  }
  const b2Endpoint = new URL(runtime["B2_S3_ENDPOINT"]!);
  if (
    b2Endpoint.protocol !== "https:" ||
    !b2Endpoint.hostname.endsWith(".backblazeb2.com")
  ) {
    throw new Error("B2_S3_ENDPOINT must be a Backblaze HTTPS S3 endpoint.");
  }
  console.info("Deployment environment is complete.");
}
