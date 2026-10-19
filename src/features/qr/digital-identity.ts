import type { PublicProfileViewModel } from "@/features/profile/profile-view-model";
import type { DigitalIdentity } from "./digital-identity-card";

export function digitalIdentityFromProfile(
  profile: Omit<PublicProfileViewModel, "publicToken">,
): DigitalIdentity {
  return {
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    title: profile.visibleFields.title ? profile.title : null,
    company: profile.visibleFields.company ? profile.company : null,
    phone: profile.visibleFields.phone ? profile.phone : null,
    website: profile.visibleFields.website ? profile.website : null,
  };
}
