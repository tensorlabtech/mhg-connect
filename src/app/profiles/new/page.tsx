import { defaultProfileVisibility } from "@/db/schema";
import { ProfileBuilder } from "@/features/profile/profile-builder";
import { createProfileDocument } from "@/features/profile/profile-document";
import { withFormTemplate } from "@/features/profile/profile-form-hints";
import { createDefaultProfileLabel } from "@/features/profile/profile-label";
import { findOwnedQrWithoutProfile } from "@/features/qr/qr-data";
import { requireSession } from "@/lib/session";

export default async function NewProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession("/profiles/new");
  const query = await searchParams;
  const qrToken = typeof query.qr === "string" ? query.qr : "";
  const validQrToken =
    qrToken && (await findOwnedQrWithoutProfile(session.user.id, qrToken))
      ? qrToken
      : "";
  const layout = query.editor === "cu" ? "classic" : "form";
  const baseDocument = createProfileDocument({
    avatarUrl: null,
    bio: null,
    company: null,
    contactEmail: session.user.email,
    coverUrl: null,
    linkedIn: null,
    location: null,
    name: session.user.name,
    phone: null,
    status: "draft",
    telegram: null,
    template: "cover",
    title: null,
    visibleFields: defaultProfileVisibility,
    website: null,
    zalo: null,
  });

  const initialDocument =
    layout === "form" ? withFormTemplate(baseDocument) : baseDocument;

  return (
    <ProfileBuilder
      initialDocument={initialDocument}
      initialProfileLabel={createDefaultProfileLabel()}
      initialVersion={0}
      layout={layout}
      linkedQr={[]}
      qrToken={validQrToken}
    />
  );
}
