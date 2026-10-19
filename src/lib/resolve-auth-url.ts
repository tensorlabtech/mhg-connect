/** Resolve only deployment configuration; never derive auth origins from request headers. */
export function resolveAuthUrl(
  env: Readonly<Record<string, string | undefined>>,
): string | undefined {
  if (env["VERCEL_ENV"] !== "preview") {
    return env["BETTER_AUTH_URL"];
  }

  return vercelHostnameToUrl("VERCEL_URL", env["VERCEL_URL"]);
}

export function resolvePreviewBranchUrl(
  env: Readonly<Record<string, string | undefined>>,
): string | undefined {
  if (env["VERCEL_ENV"] !== "preview" || !env["VERCEL_BRANCH_URL"]) {
    return undefined;
  }
  return vercelHostnameToUrl("VERCEL_BRANCH_URL", env["VERCEL_BRANCH_URL"]);
}

function vercelHostnameToUrl(
  name: string,
  hostname: string | undefined,
): string {
  if (
    !hostname ||
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/i.test(hostname)
  ) {
    throw new Error(
      `${name} must be a deployment hostname ending in .vercel.app for Preview.`,
    );
  }

  return `https://${hostname}`;
}
