import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type AuthSession } from "@/lib/auth";

export async function getSession(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(
  returnTo = "/dashboard",
): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireSession("/admin");

  if (session.user.role !== "admin") {
    redirect("/dashboard?error=admin-only");
  }

  return session;
}
