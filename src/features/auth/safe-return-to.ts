const allowedReturnPaths = ["/dashboard", "/admin", "/q/"] as const;

export function safeReturnTo(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://mhg-connect.local");
    const isAllowed = allowedReturnPaths.some((path) =>
      path.endsWith("/")
        ? parsed.pathname.startsWith(path)
        : parsed.pathname === path,
    );

    return parsed.origin === "https://mhg-connect.local" && isAllowed
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
