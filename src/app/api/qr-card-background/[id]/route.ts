import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { qrCardDesigns, qrCodes } from "@/db/schema";
import { isManagedProfileMediaUrl } from "@/lib/profile-media-storage";
import { getSession } from "@/lib/session";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const designId = new URL(request.url).searchParams.get("design");
  if (!uuidPattern.test(id) || (designId && !uuidPattern.test(designId))) {
    return new Response("Not found", { status: 404 });
  }
  const ownerFilter =
    session.user.role === "admin"
      ? eq(qrCodes.id, id)
      : and(eq(qrCodes.id, id), eq(qrCodes.ownerId, session.user.id));
  const [qr] = designId
    ? await db
        .select({ backgroundUrl: qrCardDesigns.backgroundUrl })
        .from(qrCardDesigns)
        .innerJoin(qrCodes, eq(qrCardDesigns.qrCodeId, qrCodes.id))
        .where(and(eq(qrCardDesigns.id, designId), ownerFilter))
        .limit(1)
    : await db
        .select({ backgroundUrl: qrCodes.cardBackgroundUrl })
        .from(qrCodes)
        .where(ownerFilter)
        .limit(1);

  if (!qr?.backgroundUrl) return new Response("Not found", { status: 404 });
  if (!isManagedProfileMediaUrl(qr.backgroundUrl)) {
    return new Response("Unsupported media source", { status: 400 });
  }

  // Ảnh lưu trên máy khi chạy thử là đường dẫn tương đối (/_uploads/...).
  const sourceUrl = qr.backgroundUrl.startsWith("/")
    ? new URL(qr.backgroundUrl, request.url)
    : qr.backgroundUrl;
  const source = await fetch(sourceUrl, { cache: "no-store" });
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
