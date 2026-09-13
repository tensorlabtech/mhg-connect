import {
  normalizeExternalUrl,
  type PublicProfileViewModel,
} from "@/features/profile/profile-view-model";

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildVCard(profile: PublicProfileViewModel) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(profile.name)}`,
  ];

  if (profile.company && profile.visibleFields.company)
    lines.push(`ORG:${escapeVCard(profile.company)}`);
  if (profile.title && profile.visibleFields.title)
    lines.push(`TITLE:${escapeVCard(profile.title)}`);
  if (profile.phone && profile.visibleFields.phone)
    lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
  if (profile.contactEmail && profile.visibleFields.email)
    lines.push(`EMAIL:${escapeVCard(profile.contactEmail)}`);
  if (profile.website && profile.visibleFields.website)
    lines.push(`URL:${escapeVCard(normalizeExternalUrl(profile.website))}`);
  if (profile.location && profile.visibleFields.location)
    lines.push(`ADR:;;${escapeVCard(profile.location)};;;;`);

  return [...lines, "END:VCARD"].join("\r\n");
}
