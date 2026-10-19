import type { Sql } from "postgres";

export type ReadinessIdentity = {
  environment: string;
  branch: string;
  commit: string;
  journal: string;
};
export type ReadinessMarker = ReadinessIdentity & { readyAt: string };

export function releaseBranch(env: Record<string, string | undefined>) {
  const branch = env.RELEASE_BRANCH ?? env.GITHUB_REF_NAME;
  if (!branch || !/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,254}$/.test(branch) ||
      branch.includes("..") || branch.includes("//") || branch.endsWith("/") ||
      branch.endsWith(".") || branch.split("/").some(part => part.startsWith(".") || part.endsWith(".lock"))) {
    throw new Error("RELEASE_BRANCH or GITHUB_REF_NAME must identify a safe Git branch");
  }
  return branch;
}

function verifyIdentity(identity: ReadinessIdentity) {
  if (!["preview", "production"].includes(identity.environment) ||
      !/^[a-f0-9]{40}$/.test(identity.commit) || !/^[a-f0-9]{64}$/.test(identity.journal)) {
    throw new Error("Release readiness identity is invalid");
  }
  releaseBranch({ RELEASE_BRANCH: identity.branch });
}

/** A machine-owned pointer for each environment and branch, separate from app migrations. */
export async function writeReadiness(sql: Sql, identity: ReadinessIdentity) {
  verifyIdentity(identity);
  await sql.begin(async transaction => {
    await transaction`create schema if not exists release_control`;
    await transaction`create table if not exists release_control.readiness (
      environment text not null check (environment in ('preview', 'production')),
      branch text not null,
      commit_sha text not null check (commit_sha ~ '^[a-f0-9]{40}$'),
      journal_fingerprint text not null check (journal_fingerprint ~ '^[a-f0-9]{64}$'),
      ready_at timestamptz not null default clock_timestamp(),
      primary key (environment, branch)
    )`;
    await transaction`insert into release_control.readiness
      (environment, branch, commit_sha, journal_fingerprint, ready_at)
      values (${identity.environment}, ${identity.branch}, ${identity.commit}, ${identity.journal}, clock_timestamp())
      on conflict (environment, branch) do update set
        commit_sha = excluded.commit_sha,
        journal_fingerprint = excluded.journal_fingerprint,
        ready_at = excluded.ready_at`;
  });
}

export async function readReadiness(sql: Sql, environment: string, branch: string): Promise<ReadinessMarker | null> {
  const [table] = await sql`select to_regclass('release_control.readiness') is not null as present`;
  if (!table.present) return null;
  const [row] = await sql`select environment, branch, commit_sha, journal_fingerprint,
    ready_at::text as ready_at from release_control.readiness
    where environment = ${environment} and branch = ${branch}`;
  if (!row) return null;
  return { environment: String(row.environment), branch: String(row.branch), commit: String(row.commit_sha),
    journal: String(row.journal_fingerprint), readyAt: String(row.ready_at) };
}

export function verifyReadiness(marker: ReadinessMarker | null, expected: ReadinessIdentity) {
  verifyIdentity(expected);
  if (!marker) throw new Error("Release readiness marker is pending");
  for (const field of ["environment", "branch", "commit", "journal"] as const) {
    if (marker[field] !== expected[field]) throw new Error(`Release readiness ${field} does not match this build`);
  }
  if (!Number.isFinite(Date.parse(marker.readyAt))) throw new Error("Release readiness timestamp is invalid");
}
