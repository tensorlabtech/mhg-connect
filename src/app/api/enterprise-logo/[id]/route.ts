import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enterprises, enterpriseMembers } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isManagedProfileMediaUrl } from "@/lib/profile-media-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return new Response("Not found", { status: 404 });
  if (session.user.role !== "admin") {
    const [member] = await db
      .select({ id: enterpriseMembers.userId })
      .from(enterpriseMembers)
      .where(
        and(
          eq(enterpriseMembers.userId, session.user.id),
          eq(enterpriseMembers.enterpriseId, id.data),
        ),
      )
      .limit(1);
    if (!member) return new Response("Not found", { status: 404 });
  }
  const [company] = await db
    .select()
    .from(enterprises)
    .where(eq(enterprises.id, id.data))
    .limit(1);
  if (!company?.customLogoEnabled || !company.logoUrl)
    return new Response("Not found", { status: 404 });
  if (!isManagedProfileMediaUrl(company.logoUrl))
    return new Response("Unsupported source", { status: 400 });
  try {
    const source = await fetch(
      company.logoUrl.startsWith("/")
        ? new URL(company.logoUrl, request.url)
        : company.logoUrl,
      {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    const type = source.headers.get("content-type")?.split(";")[0];
    if (
      !source.ok ||
      !source.body ||
      !["image/png", "image/jpeg", "image/webp"].includes(type || "")
    )
      return new Response("Image unavailable", { status: 502 });
    return new Response(source.body, {
      headers: {
        "Content-Type": type!,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
}
