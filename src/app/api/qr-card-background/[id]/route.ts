import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { isManagedProfileMediaUrl } from "@/lib/profile-media-storage";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const [qr] = await db
    .select({ backgroundUrl: qrCodes.cardBackgroundUrl })
    .from(qrCodes)
    .where(
      session.user.role === "admin"
        ? eq(qrCodes.id, id)
        : and(eq(qrCodes.id, id), eq(qrCodes.ownerId, session.user.id)),
    )
    .limit(1);

  if (!qr?.backgroundUrl) return new Response("Not found", { status: 404 });
  if (!isManagedProfileMediaUrl(qr.backgroundUrl)) {
    return new Response("Unsupported media source", { status: 400 });
  }

  const source = await fetch(qr.backgroundUrl, { cache: "no-store" });
  const contentType = source.headers.get("content-type") ?? "";
  if (!source.ok || !source.body || !contentType.startsWith("image/")) {
    return new Response("Image unavailable", { status: 502 });
  }

  return new Response(source.body, {
    headers: {
      "Cache-Control": "private, no-cache",
      "Content-Type": contentType,
    },
  });
}
