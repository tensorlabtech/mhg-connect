import { pathToFileURL } from "node:url";

export async function checkReleaseHead(env: Record<string, string | undefined> = process.env, request = fetch) {
  const { GITHUB_REPOSITORY: repository, GITHUB_REF: ref, GITHUB_SHA: sha, GH_TOKEN: token } = env;
  if (!repository || !ref?.startsWith("refs/heads/") || !sha || !token) {
    throw new Error("Release requires an authenticated branch commit.");
  }
  const branch = ref.slice("refs/heads/".length);
  const response = await request(`https://api.github.com/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error("Cannot verify the current branch head.");
  const data = await response.json() as { object?: { sha?: string } };
  if (data.object?.sha !== sha) throw new Error("Branch moved; refusing to release a superseded commit. Rerun the latest commit.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkReleaseHead().then(() => console.info("Release commit is current.")).catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
