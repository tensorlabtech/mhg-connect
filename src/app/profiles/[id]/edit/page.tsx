import { notFound } from "next/navigation";

import { ProfileBuilder } from "@/features/profile/profile-builder";
import { getLinkedQr, getOwnedProfile } from "@/features/profile/profile-data";
import { resolveProfileDocument } from "@/features/profile/profile-document";
import type { ProfileFormValues } from "@/features/profile/profile-form-types";
import { withFormTemplate } from "@/features/profile/profile-form-hints";
import { createDefaultProfileLabel } from "@/features/profile/profile-label";
import { requireSession } from "@/lib/session";

export default async function EditProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { editor } = await searchParams;
  const session = await requireSession(`/profiles/${id}/edit`);
  const profile = await getOwnedProfile(id, session.user.id);
  if (!profile) notFound();
  const linkedQr = await getLinkedQr(id, session.user.id);
  const fallback = profile as ProfileFormValues;
  const initialDocument = resolveProfileDocument(
    profile.publishedDocument ?? profile.draftDocument,
    fallback,
  );

  const layout = editor === "cu" ? "classic" : "form";

  return (
    <ProfileBuilder
      initialDocument={
        layout === "form" ? withFormTemplate(initialDocument) : initialDocument
      }
      initialProfileId={id}
      initialProfileLabel={
        profile.profileLabel ?? createDefaultProfileLabel(profile.createdAt)
      }
      initialVersion={profile.documentVersion}
      layout={layout}
      linkedQr={linkedQr}
    />
  );
}
