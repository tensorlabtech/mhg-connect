import { describe, expect, test } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import {
  isValidDocumentVersion,
  validateDocumentMedia,
  validateDraftDocument,
  validatePublishDocument,
} from "@/features/profile/profile-builder-server-validation";
import { createProfileDocument } from "@/features/profile/profile-document";

function createValidDocument() {
  return createProfileDocument({
    avatarUrl: null,
    bio: null,
    company: null,
    contactEmail: null,
    coverUrl: null,
    linkedIn: null,
    location: null,
    name: "Nguyen Minh Anh",
    phone: null,
    status: "draft",
    telegram: null,
    template: "cover",
    title: null,
    visibleFields: defaultProfileVisibility,
    website: null,
    zalo: null,
  });
}

describe("profile builder server validation", () => {
  test("accepts version zero only for a profile that has not been created", () => {
    expect(isValidDocumentVersion(0, false)).toBe(true);
    expect(isValidDocumentVersion(0, true)).toBe(false);
    expect(isValidDocumentVersion(1, true)).toBe(true);
    expect(isValidDocumentVersion(Number.NaN, false)).toBe(false);
    expect(isValidDocumentVersion(1.5, true)).toBe(false);
  });

  test("rejects a document with an incomplete field visibility contract", () => {
    const document = createValidDocument();
    const identity = document.blocks[0];
    if (identity.type !== "identity") throw new Error("Invalid fixture");
    const invalid = structuredClone(document) as unknown as {
      blocks: Array<{ data: { visibleFields?: Record<string, boolean> } }>;
    };
    invalid.blocks[0].data.visibleFields = { title: true };

    expect(validateDraftDocument(invalid).success).toBe(false);
  });

  test("validates only a contact email that will be visible publicly", () => {
    const visibleDocument = createValidDocument();
    const visibleContact = visibleDocument.blocks.find(
      (block) => block.type === "contact",
    );
    if (!visibleContact || visibleContact.type !== "contact") {
      throw new Error("Invalid fixture");
    }
    visibleContact.data.contactEmail = "not-an-email";
    visibleContact.data.visibleFields.email = true;

    expect(validatePublishDocument(visibleDocument)).toMatchObject({
      field: "contactEmail",
    });

    visibleContact.data.visibleFields.email = false;
    expect(validatePublishDocument(visibleDocument)).toHaveProperty("document");
  });

  test("allows bundled profile backgrounds without an upload", () => {
    const document = createValidDocument();
    document.theme.background = {
      imageUrl: "/images/profile-presets/cover-material.png",
      overlay: 0.48,
      type: "image",
    };

    expect(validateDocumentMedia(document, null)).toBeNull();
  });
});
