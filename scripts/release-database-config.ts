import { resolve, relative, isAbsolute } from "node:path";

export function releaseConfig(env: Record<string, string | undefined>) {
  const environment = env.RELEASE_ENVIRONMENT;
  if (environment !== "preview" && environment !== "production") {
    throw new Error("RELEASE_ENVIRONMENT must be preview or production");
  }
  const expectedName = environment === "production" ? "neondb" : "mhg_connect_preview";
  if (env.DATABASE_EXPECTED_NAME !== expectedName) {
    throw new Error("DATABASE_EXPECTED_NAME does not match release environment");
  }
  let url: URL;
  try { url = new URL(env.DATABASE_URL ?? ""); }
  catch { throw new Error("DATABASE_URL must be an explicit PostgreSQL URL"); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      !url.hostname.endsWith(".neon.tech") || url.hostname.includes("-pooler.") ||
      decodeURIComponent(url.pathname.slice(1)) !== expectedName ||
      !url.username || !url.password || (url.port && url.port !== "5432")) {
    throw new Error("DATABASE_URL must target the expected unpooled Neon database");
  }
  if (!["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? "")) {
    throw new Error("DATABASE_URL must explicitly require TLS");
  }
  const commit = env.RELEASE_COMMIT ?? env.GITHUB_SHA;
  if (!commit || !/^[a-f0-9]{40}$/i.test(commit)) {
    throw new Error("RELEASE_COMMIT or GITHUB_SHA must be a full Git commit SHA");
  }
  return { environment, expectedName, url, commit: commit.toLowerCase() };
}

export type ReleaseConfig = ReturnType<typeof releaseConfig>;

export function backupSettings(env: Record<string, string | undefined>, workspace = process.cwd()) {
  if (!/^[a-f0-9]{64}$/i.test(env.BACKUP_ENCRYPTION_KEY ?? "")) {
    throw new Error("BACKUP_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters");
  }
  if (!env.BACKUP_PATH || !isAbsolute(env.BACKUP_PATH)) {
    throw new Error("BACKUP_PATH must be an absolute path outside the checkout");
  }
  const path = resolve(env.BACKUP_PATH);
  const inside = relative(resolve(workspace), path);
  if (!inside || (!inside.startsWith("../") && !isAbsolute(inside))) {
    throw new Error("BACKUP_PATH must be outside the checkout");
  }
  return { path, key: Buffer.from(env.BACKUP_ENCRYPTION_KEY!, "hex") };
}
