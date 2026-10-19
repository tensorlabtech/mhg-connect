import { spawn } from "node:child_process";
import { chmod, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { ReleaseConfig } from "./release-database-config";
import { backupSettings } from "./release-database-config";
import { archiveHash, decryptArchive, encryptArchive, verifyBackupMetadata, type BackupMetadata } from "./release-backup-format";
import { fingerprint, type MigrationRecord } from "./release-migration-ledger";

export type BackupIdentity = Omit<BackupMetadata, "version" | "createdAt" | "archiveSha256">;

function pgEnvironment(config: ReleaseConfig, env: Record<string, string | undefined>): Record<string, string | undefined> {
  // Deliberately avoid inherited PG* variables and credentials in command arguments.
  return {
    PATH: env.PATH,
    PGHOST: config.url.hostname,
    PGPORT: config.url.port || "5432",
    PGDATABASE: config.expectedName,
    PGUSER: decodeURIComponent(config.url.username),
    PGPASSWORD: decodeURIComponent(config.url.password),
    PGSSLMODE: config.url.searchParams.get("sslmode")!,
    PGCONNECT_TIMEOUT: "30",
    PGAPPNAME: "mhg-connect-release-backup",
  };
}

async function runTool(binary: string, args: string[], env: Record<string, string | undefined>) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(binary, args, { env: { ...env, NODE_ENV: "production" }, stdio: "ignore", timeout: 10 * 60_000 });
    child.once("error", () => reject(new Error("PostgreSQL backup tool could not execute")));
    child.once("exit", code => code === 0 ? resolve() : reject(new Error("PostgreSQL backup tool failed; release stopped")));
  });
}

async function privateTemporary<T>(action: (archivePath: string) => Promise<T>) {
  const directory = await mkdtemp(join(tmpdir(), "mhg-release-"));
  await chmod(directory, 0o700);
  try { return await action(join(directory, "database.dump")); }
  finally { await rm(directory, { recursive: true, force: true }); }
}

async function safeBackupPath(env: Record<string, string | undefined>) {
  const settings = backupSettings(env);
  // Resolve the parent too, so a symlink cannot put an artifact inside the checkout.
  const parent = await realpath(dirname(settings.path));
  const workspace = await realpath(process.cwd());
  const location = relative(workspace, parent);
  if (!location || (!location.startsWith("../") && !isAbsolute(location))) {
    throw new Error("BACKUP_PATH parent resolves inside the checkout");
  }
  return settings;
}

export async function createBackup(config: ReleaseConfig, env: Record<string, string | undefined>, identity: BackupIdentity) {
  const settings = await safeBackupPath(env);
  await privateTemporary(async archivePath => {
    await runTool(env.PG_DUMP_BIN || "pg_dump", ["--format=custom", "--no-password", "--file", archivePath], pgEnvironment(config, env));
    await chmod(archivePath, 0o600);
    await runTool(env.PG_RESTORE_BIN || "pg_restore", ["--list", archivePath], { PATH: env.PATH });
    const archive = await readFile(archivePath);
    const metadata: BackupMetadata = { ...identity, version: 1, createdAt: new Date().toISOString(), archiveSha256: archiveHash(archive) };
    const encrypted = encryptArchive(archive, settings.key, metadata);
    // Exclusive creation prevents overwriting a previous release's recovery artifact.
    await writeFile(settings.path, encrypted, { mode: 0o600, flag: "wx" });
    await writeFile(`${settings.path}.sha256`, `${archiveHash(encrypted)}\n`, { mode: 0o600, flag: "wx" });
  });
  await validateBackup(config, env, identity);
}

async function readBackup(env: Record<string, string | undefined>) {
  const settings = await safeBackupPath(env);
  const envelope = await readFile(settings.path);
  const checksum = (await readFile(`${settings.path}.sha256`, "utf8")).trim();
  if (archiveHash(envelope) !== checksum) throw new Error("Encrypted artifact checksum mismatch");
  return decryptArchive(envelope, settings.key);
}

export async function validateBackup(config: ReleaseConfig, env: Record<string, string | undefined>, identity: BackupIdentity, applied?: MigrationRecord[]) {
  const { archive, metadata } = await readBackup(env);
  // A repeat migration can use this release's pre-migration backup, provided its
  // ledger is still an exact prefix of the currently verified database ledger.
  const expected = { ...identity };
  if (applied) {
    if (!Number.isSafeInteger(metadata.ledgerCount) || metadata.ledgerCount < 0 || metadata.ledgerCount > applied.length) {
      throw new Error("Backup migration ledger is invalid");
    }
    expected.ledgerCount = metadata.ledgerCount;
    expected.ledger = fingerprint(applied.slice(0, metadata.ledgerCount));
  }
  verifyBackupMetadata(metadata, expected);
  await privateTemporary(async archivePath => {
    await writeFile(archivePath, archive, { mode: 0o600, flag: "wx" });
    await runTool(env.PG_RESTORE_BIN || "pg_restore", ["--list", archivePath], { PATH: env.PATH });
  });
  // Intentionally never open a database connection for archive validation.
  void config;
}

export async function decryptBackup(config: ReleaseConfig, env: Record<string, string | undefined>) {
  const { archive, metadata } = await readBackup(env);
  if (metadata.environment !== config.environment || metadata.host !== config.url.hostname ||
      metadata.database !== config.expectedName || metadata.commit !== config.commit) {
    throw new Error("Backup identity does not match the requested recovery context");
  }
  // Recovery remains available after the release-window gate has expired.
  const output = env.BACKUP_DECRYPTED_PATH;
  if (!output || !isAbsolute(output)) throw new Error("BACKUP_DECRYPTED_PATH must be absolute");
  await safeBackupPath({ ...env, BACKUP_PATH: output });
  if (resolve(output) === resolve(env.BACKUP_PATH!)) throw new Error("Recovery cannot overwrite encrypted backup");
  await privateTemporary(async archivePath => {
    await writeFile(archivePath, archive, { mode: 0o600, flag: "wx" });
    await runTool(env.PG_RESTORE_BIN || "pg_restore", ["--list", archivePath], { PATH: env.PATH });
    await writeFile(output, archive, { mode: 0o600, flag: "wx" });
  });
}
