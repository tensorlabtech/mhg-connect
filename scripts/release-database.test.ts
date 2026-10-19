import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { backupSettings, releaseConfig } from "./release-database-config";
import { archiveHash, decryptArchive, encryptArchive, verifyBackupMetadata, type BackupMetadata } from "./release-backup-format";
import { fingerprint, readJournal, verifyPrefix } from "./release-migration-ledger";
import { validateBackup } from "./release-backup";

const env = {
  RELEASE_ENVIRONMENT: "production", DATABASE_EXPECTED_NAME: "neondb",
  DATABASE_URL: "postgresql://release:secret@ep-release.region.aws.neon.tech/neondb?sslmode=require",
  RELEASE_COMMIT: "a".repeat(40), BACKUP_ENCRYPTION_KEY: "ab".repeat(32),
};
const archive = Buffer.from("PGDMP example test payload; never a successful database backup");
const metadata: BackupMetadata = {
  version: 1, environment: "production", host: "ep-release.region.aws.neon.tech",
  database: "neondb", commit: env.RELEASE_COMMIT, journal: "journal", ledger: "ledger", ledgerCount: 0,
  createdAt: new Date().toISOString(), archiveSha256: archiveHash(archive),
};
const key = Buffer.from(env.BACKUP_ENCRYPTION_KEY, "hex");

describe("release database environment guards", () => {
  it("accepts only explicit isolated Neon targets", () => {
    expect(releaseConfig(env).expectedName).toBe("neondb");
    expect(releaseConfig({ ...env, RELEASE_ENVIRONMENT: "preview", DATABASE_EXPECTED_NAME: "mhg_connect_preview", DATABASE_URL: env.DATABASE_URL.replace("/neondb", "/mhg_connect_preview") }).environment).toBe("preview");
  });
  it.each([
    { RELEASE_ENVIRONMENT: "development" }, { DATABASE_EXPECTED_NAME: "mhg_connect_preview" },
    { DATABASE_URL: "postgres://test:test@localhost/neondb?sslmode=require" },
    { DATABASE_URL: env.DATABASE_URL.replace("ep-release.", "ep-release-pooler.") },
    { DATABASE_URL: env.DATABASE_URL.replace("/neondb", "/mhg_connect_preview") },
    { DATABASE_URL: env.DATABASE_URL.replace("sslmode=require", "sslmode=disable") },
    { RELEASE_COMMIT: "short" }, { DATABASE_URL: "" },
  ])("rejects misrouted or incomplete config %j", change => {
    expect(() => releaseConfig({ ...env, ...change })).toThrow();
  });
  it("rejects checkout artifacts and weak keys", () => {
    expect(() => backupSettings({ ...env, BACKUP_PATH: join(process.cwd(), "backup.enc") })).toThrow("outside");
    expect(() => backupSettings({ ...env, BACKUP_PATH: "/tmp/backup.enc", BACKUP_ENCRYPTION_KEY: "short" })).toThrow("64");
  });
});

describe("migration ledger exact-prefix verification", () => {
  const journal = [{ hash: "first", created_at: "100" }, { hash: "second", created_at: "200" }];
  it("allows pending migrations and complete repeat releases", () => {
    expect(() => verifyPrefix([], journal)).not.toThrow();
    expect(() => verifyPrefix(journal.slice(0, 1), journal)).not.toThrow();
    expect(() => verifyPrefix(journal, journal, true)).not.toThrow();
  });
  it.each([
    [journal[1]], [journal[1], journal[0]], [journal[0], journal[0]],
    [{ ...journal[0], hash: "modified" }], [{ ...journal[0], created_at: "101" }],
    [...journal, { hash: "future", created_at: "300" }],
  ])("rejects missing, reordered, duplicate, changed and ahead ledgers %j", (...rows) => {
    expect(() => verifyPrefix(rows, journal)).toThrow();
  });
  it("requires every migration after application", () => {
    expect(() => verifyPrefix(journal.slice(0, 1), journal, true)).toThrow();
  });
  it("hashes the real checked-in migration bytes and journal timestamps", async () => {
    const journal = await readJournal(join(process.cwd(), "drizzle"));
    expect(journal.length).toBeGreaterThan(0);
    expect(journal[0].hash).toBe(archiveHash(await readFile("drizzle/0000_faithful_karma.sql")));
    expect(journal[0].created_at).toBe("1789045618307");
  });
});

describe("authenticated encrypted backups", () => {
  it("round trips archive and authenticated recovery metadata", () => {
    const encrypted = encryptArchive(archive, key, metadata);
    const decrypted = decryptArchive(encrypted, key);
    expect(decrypted.archive).toEqual(archive);
    expect(decrypted.metadata).toEqual(metadata);
    expect(encrypted.includes(archive)).toBe(false);
    expect(encryptArchive(archive, key, metadata)).not.toEqual(encrypted);
  });
  it("rejects another key, tampered ciphertext and changed metadata", () => {
    const encrypted = encryptArchive(archive, key, metadata);
    expect(() => decryptArchive(encrypted, Buffer.alloc(32))).toThrow("authentication");
    const data = JSON.parse(encrypted.toString());
    data.ciphertext = Buffer.alloc(archive.length).toString("base64");
    expect(() => decryptArchive(Buffer.from(JSON.stringify(data)), key)).toThrow("authentication");
    const altered = JSON.parse(encrypted.toString());
    altered.metadata = Buffer.from(JSON.stringify({ ...metadata, database: "other" })).toString("base64");
    expect(() => decryptArchive(Buffer.from(JSON.stringify(altered)), key)).toThrow("authentication");
  });
  it("binds production backup to database, commit, journal and current ledger", () => {
    const identity = { environment: metadata.environment, host: metadata.host, database: metadata.database,
      commit: metadata.commit, journal: metadata.journal, ledger: metadata.ledger, ledgerCount: metadata.ledgerCount };
    expect(() => verifyBackupMetadata(metadata, identity)).not.toThrow();
    for (const field of ["environment", "host", "database", "commit", "journal", "ledger"] as const) {
      expect(() => verifyBackupMetadata(metadata, { ...identity, [field]: "other" })).toThrow("match release");
    }
    expect(() => verifyBackupMetadata({ ...metadata, createdAt: "2000-01-01" }, identity)).toThrow("24-hour");
  });
  it("fails closed for missing artifact, checksum or unreadable archive", async () => {
    const directory = await mkdtemp(join(tmpdir(), "mhg-release-test-"));
    const testEnv = { ...env, BACKUP_PATH: join(directory, "backup.enc") };
    const config = releaseConfig(testEnv);
    const identity = { environment: metadata.environment, host: metadata.host, database: metadata.database,
      commit: metadata.commit, journal: metadata.journal, ledger: fingerprint([]), ledgerCount: 0 };
    try {
      await expect(validateBackup(config, testEnv, identity)).rejects.toThrow();
      const encrypted = encryptArchive(archive, key, { ...metadata, ledger: identity.ledger });
      await writeFile(testEnv.BACKUP_PATH, encrypted);
      await expect(validateBackup(config, testEnv, identity)).rejects.toThrow();
      await writeFile(`${testEnv.BACKUP_PATH}.sha256`, "wrong");
      await expect(validateBackup(config, testEnv, identity)).rejects.toThrow("checksum");
      await writeFile(`${testEnv.BACKUP_PATH}.sha256`, archiveHash(encrypted));
      await expect(validateBackup(config, { ...testEnv, PG_RESTORE_BIN: "/not/a/pg_restore" }, identity)).rejects.toThrow("could not execute");
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
