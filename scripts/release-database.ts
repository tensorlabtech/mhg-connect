import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { releaseConfig } from "./release-database-config";
import { fingerprint, readJournal, readLedger, verifyPrefix } from "./release-migration-ledger";
import { createBackup, decryptBackup, validateBackup } from "./release-backup";
import { releaseBranch, writeReadiness } from "./release-readiness";

export async function releaseDatabase(command: string, env: Record<string, string | undefined>) {
  if (!["check", "backup", "migrate", "decrypt", "ready"].includes(command)) {
    throw new Error("Usage: release:db -- check|backup|migrate|decrypt|ready");
  }
  const config = releaseConfig(env);
  const branch = command === "ready" ? releaseBranch(env) : undefined;
  if (command === "decrypt") {
    await decryptBackup(config, env);
    console.log("Decrypted archive validated and saved outside checkout; no database restore performed");
    return;
  }
  const folder = resolve("drizzle");
  const journal = await readJournal(folder);
  const sql = postgres(config.url.toString(), {
    max: 1, idle_timeout: 0, max_lifetime: 0, connect_timeout: 30,
    connection: { application_name: "mhg-connect-release", lock_timeout: 30000, statement_timeout: 600000 },
    onnotice: () => {},
  });
  let locked = false;
  try {
    const [database] = await sql`select current_database() as name`;
    if (database.name !== config.expectedName) throw new Error("Connected database identity mismatch");
    if (command !== "check") {
      const [lock] = await sql`select pg_try_advisory_lock(hashtext(current_database()), hashtext('mhg-connect-release')) as acquired`;
      if (!lock.acquired) throw new Error("Another database release holds the advisory lock");
      locked = true;
    }
    const applied = await readLedger(sql);
    verifyPrefix(applied, journal);
    const identity = {
      environment: config.environment, host: config.url.hostname,
      database: config.expectedName, commit: config.commit,
      journal: fingerprint(journal), ledger: fingerprint(applied), ledgerCount: applied.length,
    };
    if (command === "backup") {
      await createBackup(config, env, identity);
      const afterBackup = await readLedger(sql);
      if (fingerprint(afterBackup) !== identity.ledger) throw new Error("Migration ledger changed during backup");
      console.log("Encrypted database backup and archive validation completed");
    } else if (command === "migrate") {
      if (config.environment === "production") await validateBackup(config, env, identity, applied);
      // Recheck after potentially lengthy archive validation, while holding the same session lock.
      verifyPrefix(await readLedger(sql), journal);
      await migrate(drizzle(sql), { migrationsFolder: folder });
      verifyPrefix(await readLedger(sql), journal, true);
      console.log(`Database migration verified: ${journal.length} matching migrations`);
    } else if (command === "ready") {
      verifyPrefix(await readLedger(sql), journal, true);
      await writeReadiness(sql, { environment: config.environment, branch: branch!,
        commit: config.commit, journal: fingerprint(journal) });
      console.log("Exact-commit database readiness marker recorded");
    } else {
      console.log(`Database ledger verified: ${applied.length}/${journal.length} matching migrations`);
    }
  } finally {
    if (locked) {
      try { await sql`select pg_advisory_unlock(hashtext(current_database()), hashtext('mhg-connect-release'))`; }
      catch { /* Closing the connection also releases the session lock. */ }
    }
    await sql.end({ timeout: 5 });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  releaseDatabase(process.argv[2] ?? "", process.env).catch(() => {
    // Driver/tool failures may embed SQL or credentials. Do not print raw errors.
    console.error("Database release failed. Verify environment, ledger, backup and PostgreSQL tools; no deployment should proceed.");
    process.exitCode = 1;
  });
}
