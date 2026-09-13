import { describe, expect, test } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import { createProfileDocument } from "@/features/profile/profile-document";
import { getPublishedProfileSnapshot } from "@/features/profile/published-profile-snapshot";

const document = createProfileDocument({
  avatarUrl: null,
  bio: "Nội dung đã phát hành",
  company: "MHG",
  contactEmail: null,
  coverUrl: null,
  linkedIn: null,
  location: null,
  name: "Nguyễn Minh Anh",
  phone: null,
  status: "published",
  telegram: null,
  template: "cover",
  title: "Giám đốc phát triển sản phẩm",
  visibleFields: defaultProfileVisibility,
  website: null,
  zalo: null,
});

describe("getPublishedProfileSnapshot", () => {
  test("returns only a valid snapshot from a published profile", () => {
    expect(
      getPublishedProfileSnapshot({
        publishedDocument: document,
        status: "published",
      }),
    ).toEqual(document);
  });

  test.each([
    { publishedDocument: document, status: "draft" as const },
    { publishedDocument: null, status: "published" as const },
    { publishedDocument: { blocks: [] }, status: "published" as const },
  ])("rejects a non-public or invalid snapshot", (profile) => {
    expect(getPublishedProfileSnapshot(profile)).toBeNull();
  });
});
