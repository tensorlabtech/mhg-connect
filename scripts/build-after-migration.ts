import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";
import { fingerprint, readJournal, readLedger, verifyPrefix } from "./release-migration-ledger";
import { readReadiness, releaseBranch, verifyReadiness, type ReadinessIdentity } from "./release-readiness";

export function buildGateConfig(env: Record<string, string | undefined>) {
  const environment = env.VERCEL_ENV;
  if (env.VERCEL !== "1" || (environment !== "production" && environment !== "preview")) {
    throw new Error("Deployment build gate requires a native Vercel Preview or Production build.");
  }
  const commit = env.VERCEL_GIT_COMMIT_SHA;
  if (!commit || !/^[a-f0-9]{40}$/i.test(commit)) throw new Error("Vercel must provide a full source commit SHA.");
  const branch = releaseBranch({ RELEASE_BRANCH: env.VERCEL_GIT_COMMIT_REF });
  if (environment === "production" && branch !== "main") throw new Error("Production builds require main.");
  const expectedName = environment === "production" ? "neondb" : "mhg_connect_preview";
  let url: URL;
  try { url = new URL(env.DATABASE_URL ?? ""); }
  catch { throw new Error("An explicit deployment database is required."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname.endsWith(".neon.tech") ||
      decodeURIComponent(url.pathname.slice(1)) !== expectedName || !url.username || !url.password ||
      (url.port && url.port !== "5432") || !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? "")) {
    throw new Error("Deployment database must be the expected Neon database with TLS.");
  }
  return { environment, branch, commit: commit.toLowerCase(), url, expectedName };
}

type GateRuntime = {
  ready: () => Promise<boolean>;
  assertHead: () => Promise<void>;
  build: () => Promise<void>;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
};

export async function runBuildGate(runtime: GateRuntime, timeoutMs = 15 * 60_000, intervalMs = 10_000) {
  const deadline = runtime.now() + timeoutMs;
  while (true) {
    if (runtime.now() >= deadline) throw new Error("Timed out waiting for database release readiness.");
    const ready = await runtime.ready();
    if (runtime.now() >= deadline) throw new Error("Timed out waiting for database release readiness.");
    if (ready) break;
    await runtime.sleep(Math.min(intervalMs, deadline - runtime.now()));
  }
  await runtime.assertHead();
  await runtime.build();
  // Another branch may have advanced the shared database while Next.js compiled.
  if (!await runtime.ready()) throw new Error("Database release readiness changed during the build.");
  await runtime.assertHead();
}

function childCommand(binary: string, args: string[], capture = false): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(binary, args, {
      shell: false, env: process.env, stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      ...(capture ? { timeout: 30_000 } : {}),
    });
    let output = "";
    child.stdout?.on("data", (chunk: Buffer) => { output += chunk.toString(); });
    child.stderr?.resume();
    child.once("error", () => reject(new Error(`${binary} failed to start.`)));
    child.once("close", (code) => code === 0 ? resolvePromise(output.trim()) : reject(new Error(`${binary} failed; release build stopped.`)));
  });
}

export function verifyRemoteHead(output: string, branch: string, commit: string) {
  const parts = output.split(/\s+/);
  if (parts.length !== 2 || parts[0] !== commit || parts[1] !== `refs/heads/${branch}`) {
    throw new Error("Source branch moved; refusing to publish a superseded build.");
  }
}

export function transientDatabaseError(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  return code.startsWith("08") || ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND", "CONNECT_TIMEOUT", "CONNECTION_CLOSED", "CONNECTION_ENDED", "57P01", "57P02", "57P03", "53300"].includes(code);
}

export async function buildAfterMigration(env: Record<string, string | undefined> = process.env) {
  const config = buildGateConfig(env);
  const journal = await readJournal(resolve("drizzle"));
  const expected: ReadinessIdentity = { environment: config.environment, branch: config.branch, commit: config.commit, journal: fingerprint(journal) };
  const sql = postgres(config.url.toString(), {
    max: 1, connect_timeout: 10, idle_timeout: 5,
    connection: { application_name: "mhg-connect-build-gate", statement_timeout: 10000 }, onnotice: () => {},
  });
  async function ready() {
    try {
      const [database] = await sql`select current_database() as name`;
      if (database.name !== config.expectedName) throw new Error("Connected deployment database identity mismatch.");
      const marker = await readReadiness(sql, config.environment, config.branch);
      try { verifyReadiness(marker, expected); }
      catch { return false; }
      verifyPrefix(await readLedger(sql), journal, true);
      return true;
    } catch (error) {
      if (transientDatabaseError(error)) return false;
      throw error;
    }
  }
  try {
    console.info("Waiting for the exact database release readiness marker.");
    await runBuildGate({
      ready,
      assertHead: async () => verifyRemoteHead(await childCommand("git", ["ls-remote", "https://github.com/tensorlabtech/mhg-connect.git", `refs/heads/${config.branch}`], true), config.branch, config.commit),
      build: async () => { await childCommand("npm", ["run", "build"]); },
      now: Date.now,
      sleep: (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms)),
    });
    console.info("Source head, database readiness and complete migration ledger verified after build.");
  } finally { await sql.end({ timeout: 5 }); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  buildAfterMigration().catch(() => {
    console.error("Deployment build gate failed. Check database release workflow, source head and migration readiness; existing deployment remains serving.");
    process.exitCode = 1;
  });
}
