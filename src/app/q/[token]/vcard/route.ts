import { getQrByToken } from "@/features/qr/qr-data";
import { profileDocumentToFlat } from "@/features/profile/profile-document";
import { getPublishedProfileSnapshot } from "@/features/profile/published-profile-snapshot";
import { buildVCard } from "@/features/profile/vcard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const result = await getQrByToken(token);
  const publishedDocument = getPublishedProfileSnapshot(result?.profile);

  if (!result || result.qr.status !== "active" || !publishedDocument) {
    return new Response("Not found", { status: 404 });
  }

  const body = buildVCard({
    ...profileDocumentToFlat(publishedDocument),
    publicToken: token,
  });
  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="mhg-connect-${token.replace(/[^a-z0-9-]/gi, "-")}.vcf"`,
      "Content-Type": "text/vcard; charset=utf-8",
    },
  });
}
