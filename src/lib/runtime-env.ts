import "server-only";

const runtime = globalThis.process?.["env"] ?? {};
const isProductionBuild = runtime["NEXT_PHASE"] === "phase-production-build";

export const runtimeEnv = {
  databaseUrl: runtime["DATABASE_URL"],
  authSecret:
    runtime["BETTER_AUTH_SECRET"] ??
    (isProductionBuild ? crypto.randomUUID().repeat(2) : undefined),
  authUrl:
    runtime["BETTER_AUTH_URL"] ??
    (isProductionBuild ? "http://localhost:3000" : undefined),
  blobToken: runtime["BLOB_READ_WRITE_TOKEN"],
  b2ApplicationKey: runtime["B2_APPLICATION_KEY"],
  b2BucketName: runtime["B2_BUCKET_NAME"],
  b2KeyId: runtime["B2_KEY_ID"],
  b2PublicUrlBase: runtime["B2_PUBLIC_URL_BASE"],
  b2Region: runtime["B2_REGION"],
  b2S3Endpoint: runtime["B2_S3_ENDPOINT"],
  /** "local": khi chạy thử trên máy, lưu ảnh vào public/_uploads thay vì kho ảnh B2. */
  mediaStorage: runtime["MEDIA_STORAGE"],
  adminEmail: runtime["ADMIN_EMAIL"],
  adminPassword: runtime["ADMIN_PASSWORD"],
  adminName: runtime["ADMIN_NAME"],
  demoUserEmail: runtime["DEMO_USER_EMAIL"],
  demoUserPassword: runtime["DEMO_USER_PASSWORD"],
  nodeEnv: runtime["NODE_ENV"],
  isProductionBuild,
} as const;

export function requireRuntimeEnv(
  key: Exclude<keyof typeof runtimeEnv, "isProductionBuild">,
  purpose: string,
): string {
  const value = runtimeEnv[key];

  if (!value) {
    throw new Error(`Missing environment variable for ${purpose}.`);
  }

  return value;
}
