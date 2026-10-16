import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import {
  canReadLocalDraft,
  isSafeDraftAsset,
} from "@/features/local-draft/local-draft-policy";
import { localDraftDirectory } from "@/features/local-draft/local-draft-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  if (!canReadLocalDraft(process.env.NODE_ENV, (await headers()).get("host")))
    return new Response("Not found", { status: 404 });
  const { slug, name } = await params;
  if (!isSafeDraftAsset(name))
    return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(
      path.join(localDraftDirectory(slug), "assets", name),
    );
    const contentType = name.endsWith(".png")
      ? "image/png"
      : name.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
