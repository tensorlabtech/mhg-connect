import type { ProfileVisibility } from "@/db/schema";

export type PublicProfileViewModel = {
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  company: string | null;
  contactEmail: string | null;
  linkedIn: string | null;
  location: string | null;
  name: string;
  phone: string | null;
  publicToken: string;
  telegram: string | null;
  template: "cover" | "minimal";
  title: string | null;
  visibleFields: ProfileVisibility;
  website: string | null;
  zalo: string | null;
};

export function visibleValue(
  profile: PublicProfileViewModel,
  field: keyof ProfileVisibility,
  value: string | null,
) {
  return profile.visibleFields[field] && value?.trim() ? value.trim() : null;
}

export function normalizeExternalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
