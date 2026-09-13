import { notFound } from "next/navigation";

import { ProfileBuilder } from "@/features/profile/profile-builder";
import { getLinkedQr, getOwnedProfile } from "@/features/profile/profile-data";
import { resolveProfileDocument } from "@/features/profile/profile-document";
import type { ProfileFormValues } from "@/features/profile/profile-form-types";
import { createDefaultProfileLabel } from "@/features/profile/profile-label";
import { requireSession } from "@/lib/session";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession(`/profiles/${id}/edit`);
  const profile = await getOwnedProfile(id, session.user.id);
  if (!profile) notFound();
  const linkedQr = await getLinkedQr(id, session.user.id);
  const fallback = profile as ProfileFormValues;
  const initialDocument = resolveProfileDocument(
    profile.publishedDocument ?? profile.draftDocument,
    fallback,
  );

  return (
    <ProfileBuilder
      initialDocument={initialDocument}
      initialProfileId={id}
      initialProfileLabel={
        profile.profileLabel ?? createDefaultProfileLabel(profile.createdAt)
      }
      initialVersion={profile.documentVersion}
      linkedQr={linkedQr}
    />
  );
}
