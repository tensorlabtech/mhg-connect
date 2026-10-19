import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Sql } from "postgres";

export type MigrationRecord = { hash: string; created_at: string | number };
export const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function readJournal(folder: string) {
  const journal = JSON.parse(await readFile(join(folder, "meta/_journal.json"), "utf8")) as {
    entries: { idx: number; when: number; tag: string }[];
  };
  const records: MigrationRecord[] = [];
  const tags = new Set<string>();
  for (const [index, entry] of journal.entries.entries()) {
    if (entry.idx !== index || !Number.isSafeInteger(entry.when) ||
        entry.when <= Number(records.at(-1)?.created_at ?? 0) ||
        !/^[a-z0-9_]+$/.test(entry.tag) || tags.has(entry.tag)) {
      throw new Error("Migration journal order or identity is invalid");
    }
    tags.add(entry.tag);
    const sql = await readFile(join(folder, `${entry.tag}.sql`), "utf8");
    records.push({ hash: createHash("sha256").update(sql).digest("hex"), created_at: String(entry.when) });
  }
  if (!records.length) throw new Error("Migration journal is empty");
  return records;
}

export function verifyPrefix(applied: MigrationRecord[], journal: MigrationRecord[], complete = false) {
  if (applied.length > journal.length || (complete && applied.length !== journal.length)) {
    throw new Error("Database migration ledger length does not match release journal");
  }
  applied.forEach((row, index) => {
    const expected = journal[index];
    if (row.hash !== expected.hash || String(row.created_at) !== String(expected.created_at)) {
      throw new Error(`Database migration ledger diverges at position ${index + 1}`);
    }
  });
}

export async function readLedger(sql: Sql) {
  const [exists] = await sql`select to_regclass('drizzle.__drizzle_migrations') is not null as present`;
  if (!exists.present) {
    // A missing ledger on a populated database is never permission to bootstrap it.
    const tables = await sql`select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname not in ('pg_catalog','information_schema')
      and n.nspname not like 'pg_toast%' and c.relkind in ('r','p','v','m','f','S') limit 1`;
    if (tables.length) throw new Error("Migration ledger missing on a nonempty database");
    return [];
  }
  const rows = await sql`select hash, created_at from drizzle.__drizzle_migrations order by id`;
  return rows.map(row => ({ hash: String(row.hash), created_at: String(row.created_at) }));
}
