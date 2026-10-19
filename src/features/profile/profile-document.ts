import { defaultProfileVisibility } from "@/db/schema";
import type { ProfileFormValues } from "@/features/profile/profile-form-types";
import type {
  ProfileBlock,
  ProfileBlockType,
  ProfileDocument,
} from "@/features/profile/profile-document-types";
import { parseProfileDocument } from "@/features/profile/profile-document-schema";

export function createProfileDocument(
  profile: ProfileFormValues,
): ProfileDocument {
  return {
    blocks: [
      {
        data: {
          avatarUrl: profile.avatarUrl,
          company: profile.company,
          coverUrl: profile.coverUrl,
          location: profile.location,
          name: profile.name,
          title: profile.title,
          visibleFields: {
            company: profile.visibleFields.company,
            location: profile.visibleFields.location,
            title: profile.visibleFields.title,
          },
        },
        id: "identity",
        locked: true,
        type: "identity",
        visible: true,
      },
      {
        data: { text: profile.bio },
        id: "bio",
        type: "bio",
        visible: profile.visibleFields.bio,
      },
      {
        data: {
          contactEmail: profile.contactEmail,
          phone: profile.phone,
          visibleFields: {
            email: profile.visibleFields.email,
            phone: profile.visibleFields.phone,
            website: profile.visibleFields.website,
          },
          website: profile.website,
        },
        id: "contact",
        type: "contact",
        visible: true,
      },
      {
        data: {
          facebook: null,
          github: null,
          instagram: null,
          linkedIn: profile.linkedIn,
          telegram: profile.telegram,
          tiktok: null,
          visibleFields: {
            facebook: true,
            github: true,
            instagram: true,
            linkedIn: profile.visibleFields.linkedIn,
            telegram: profile.visibleFields.telegram,
            tiktok: true,
            x: true,
            youtube: true,
            zalo: profile.visibleFields.zalo,
          },
          x: null,
          youtube: null,
          zalo: profile.zalo,
        },
        id: "social",
        type: "social",
        visible: true,
      },
    ],
    schemaVersion: 1,
    theme: {
      background: { type: "style" },
      headerLayout: profile.template,
      themeId: "signature-dark",
    },
  };
}

export function resolveProfileDocument(
  value: unknown,
  fallback: ProfileFormValues,
) {
  return parseProfileDocument(value) ?? createProfileDocument(fallback);
}

export function getProfileBlock<T extends ProfileBlockType>(
  document: ProfileDocument,
  type: T,
) {
  return document.blocks.find((block) => block.type === type) as Extract<
    ProfileBlock,
    { type: T }
  >;
}

export function moveProfileBlock(
  document: ProfileDocument,
  activeId: ProfileBlockType,
  overId: ProfileBlockType,
): ProfileDocument {
  if (activeId === "identity" || overId === "identity" || activeId === overId)
    return document;
  const from = document.blocks.findIndex((block) => block.id === activeId);
  const to = document.blocks.findIndex((block) => block.id === overId);
  if (from < 1 || to < 1) return document;
  const blocks = [...document.blocks];
  const [moved] = blocks.splice(from, 1);
  blocks.splice(to, 0, moved);
  return { ...document, blocks };
}

export function profileDocumentToFlat(document: ProfileDocument) {
  const identity = getProfileBlock(document, "identity");
  const bio = getProfileBlock(document, "bio");
  const contact = getProfileBlock(document, "contact");
  const social = getProfileBlock(document, "social");
  return {
    avatarUrl: identity.data.avatarUrl,
    bio: bio.data.text,
    company: identity.data.company,
    contactEmail: contact.data.contactEmail,
    coverUrl: identity.data.coverUrl,
    linkedIn: social.data.linkedIn,
    location: identity.data.location,
    name: identity.data.name,
    phone: contact.data.phone,
    telegram: social.data.telegram,
    template: document.theme.headerLayout,
    title: identity.data.title,
    visibleFields: {
      ...defaultProfileVisibility,
      ...identity.data.visibleFields,
      bio: bio.visible,
      email: contact.visible && contact.data.visibleFields.email,
      phone: contact.visible && contact.data.visibleFields.phone,
      website: contact.visible && contact.data.visibleFields.website,
      linkedIn: social.visible && social.data.visibleFields.linkedIn,
      telegram: social.visible && social.data.visibleFields.telegram,
      zalo: social.visible && social.data.visibleFields.zalo,
    },
    website: contact.data.website,
    zalo: social.data.zalo,
  };
}

export function documentsEqual(
  first: ProfileDocument,
  second: ProfileDocument,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function normalizeProfileDocumentVisibility(
  document: ProfileDocument,
): ProfileDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) => {
      if (block.type === "identity") {
        return {
          ...block,
          data: {
            ...block.data,
            visibleFields: {
              company: Boolean(block.data.company?.trim()),
              location: Boolean(block.data.location?.trim()),
              title: Boolean(block.data.title?.trim()),
            },
          },
        };
      }
      if (block.type === "contact") {
        return {
          ...block,
          data: {
            ...block.data,
            visibleFields: {
              email: Boolean(block.data.contactEmail?.trim()),
              phone: Boolean(block.data.phone?.trim()),
              website: Boolean(block.data.website?.trim()),
            },
          },
        };
      }
      if (block.type === "social") {
        return {
          ...block,
          data: {
            ...block.data,
            visibleFields: Object.fromEntries(
              Object.keys(block.data.visibleFields).map((field) => [
                field,
                Boolean(
                  block.data[
                    field as keyof typeof block.data.visibleFields
                  ]?.trim(),
                ),
              ]),
            ) as typeof block.data.visibleFields,
          },
        };
      }
      return block;
    }),
  } as ProfileDocument;
}
