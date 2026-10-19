export function canReadLocalDraft(
  nodeEnv: string | undefined,
  host: string | null,
) {
  if (nodeEnv !== "development" || !host) return false;
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
}

export function isSafeDraftAsset(name: string) {
  return /^[a-z0-9][a-z0-9-]{0,100}\.(png|jpe?g|webp)$/i.test(name);
}
