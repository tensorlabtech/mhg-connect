import { describe, expect, it } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import {
  createProfileDocument,
  getProfileBlock,
  moveProfileBlock,
  normalizeProfileDocumentVisibility,
  profileDocumentToFlat,
  resolveProfileDocument,
} from "@/features/profile/profile-document";
import { parseProfileDocument } from "@/features/profile/profile-document-schema";
import type { ProfileFormValues } from "@/features/profile/profile-form-types";
import { applyProfileStyle } from "@/features/profile/profile-style-packs";

const profile: ProfileFormValues = {
  avatarUrl: "/avatar.jpg",
  bio: "Giới thiệu",
  company: "MHG",
  contactEmail: "hello@example.test",
  coverUrl: "/cover.jpg",
  linkedIn: "linkedin.com/in/example",
  location: "Hà Nội",
  name: "Nguyễn Minh Anh",
  phone: "0901234567",
  status: "published",
  telegram: "@example",
  template: "cover",
  title: "Giám đốc",
  visibleFields: { ...defaultProfileVisibility, telegram: false },
  website: "example.test",
  zalo: "0901234567",
};

describe("profile document", () => {
  it("round-trips existing flat profile data", () => {
    const document = createProfileDocument(profile);
    expect(parseProfileDocument(document)).toEqual(document);
    expect(profileDocumentToFlat(document)).toMatchObject({
      bio: profile.bio,
      contactEmail: profile.contactEmail,
      name: profile.name,
      template: profile.template,
      visibleFields: profile.visibleFields,
    });
  });

  it("upgrades an existing document with the default style background", () => {
    const legacyDocument = structuredClone(
      createProfileDocument(profile),
    ) as unknown as { theme: { background?: unknown } };
    delete legacyDocument.theme.background;

    expect(parseProfileDocument(legacyDocument)?.theme).toMatchObject({
      background: { type: "style" },
      themeId: "signature-dark",
    });
  });

  it("accepts an effect as a complete background choice", () => {
    const document = createProfileDocument(profile);
    document.theme.background = { effectId: "aurora", type: "effect" };

    expect(parseProfileDocument(document)?.theme.background).toEqual({
      effectId: "aurora",
      type: "effect",
    });
  });

  it("restores the selected style background when switching styles", () => {
    const document = createProfileDocument(profile);
    document.theme.background = { presetId: "forest", type: "preset" };

    expect(applyProfileStyle(document, "studio-light").theme).toEqual({
      background: { type: "style" },
      headerLayout: "minimal",
      themeId: "studio-light",
    });
  });

  it("keeps identity locked first while moving optional blocks", () => {
    const document = createProfileDocument(profile);
    const moved = moveProfileBlock(document, "social", "bio");
    expect(moved.blocks.map((block) => block.type)).toEqual([
      "identity",
      "social",
      "bio",
      "contact",
    ]);
    expect(moveProfileBlock(moved, "identity", "bio")).toEqual(moved);
  });

  it("falls back when a persisted document is invalid", () => {
    const document = resolveProfileDocument(
      { blocks: [], schemaVersion: 1 },
      profile,
    );
    expect(getProfileBlock(document, "identity").data.name).toBe(profile.name);
  });

  it("upgrades older social blocks with the new platform fields", () => {
    const legacyDocument = JSON.parse(
      JSON.stringify(createProfileDocument(profile)),
    );
    const social = legacyDocument.blocks.find(
      (block: { type: string }) => block.type === "social",
    );
    for (const field of [
      "facebook",
      "github",
      "instagram",
      "tiktok",
      "x",
      "youtube",
    ]) {
      delete social.data[field];
      delete social.data.visibleFields[field];
    }

    const parsed = parseProfileDocument(legacyDocument);
    expect(parsed).not.toBeNull();
    expect(getProfileBlock(parsed!, "social").data).toMatchObject({
      facebook: null,
      github: null,
      instagram: null,
      tiktok: null,
      x: null,
      youtube: null,
    });
  });

  it("removes contact and social actions when their blocks are hidden", () => {
    const document = createProfileDocument(profile);
    const hidden = {
      ...document,
      blocks: document.blocks.map((block) =>
        block.type === "contact" || block.type === "social"
          ? { ...block, visible: false }
          : block,
      ),
    };

    expect(profileDocumentToFlat(hidden).visibleFields).toMatchObject({
      email: false,
      linkedIn: false,
      phone: false,
      telegram: false,
      website: false,
      zalo: false,
    });
  });

  it("derives field visibility from whether editable values are filled", () => {
    const document = createProfileDocument(profile);
    const changed = {
      ...document,
      blocks: document.blocks.map((block) => {
        if (block.type === "identity") {
          return {
            ...block,
            data: {
              ...block.data,
              company: null,
              visibleFields: { company: true, location: false, title: false },
            },
          };
        }
        if (block.type === "contact") {
          return {
            ...block,
            visible: false,
            data: {
              ...block.data,
              visibleFields: { email: false, phone: false, website: false },
            },
          };
        }
        return block;
      }),
    } as typeof document;

    const normalized = normalizeProfileDocumentVisibility(changed);

    expect(getProfileBlock(normalized, "identity").data.visibleFields).toEqual({
      company: false,
      location: true,
      title: true,
    });
    expect(getProfileBlock(normalized, "contact").data.visibleFields).toEqual({
      email: true,
      phone: true,
      website: true,
    });
    expect(getProfileBlock(normalized, "contact").visible).toBe(false);
  });
});
