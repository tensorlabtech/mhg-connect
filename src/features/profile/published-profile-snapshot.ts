import type { ProfileStatus } from "@/db/schema";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import { parseProfileDocument } from "@/features/profile/profile-document-schema";

export function getPublishedProfileSnapshot(
  profile:
    { publishedDocument: unknown; status: ProfileStatus } | null | undefined,
): ProfileDocument | null {
  if (profile?.status !== "published") return null;
  return parseProfileDocument(profile.publishedDocument);
}
