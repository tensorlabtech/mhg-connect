import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import {
  createProfileDocument,
  profileDocumentToFlat,
} from "@/features/profile/profile-document";
import { PublicProfile } from "@/features/profile/public-profile";

const document = createProfileDocument({
  avatarUrl: null,
  bio: "Private draft",
  company: "MHG",
  contactEmail: "user@example.test",
  coverUrl: null,
  linkedIn: null,
  location: "Hà Nội",
  name: "Nguyen Minh Anh",
  phone: "+84 912 345 678",
  status: "draft",
  telegram: null,
  template: "cover",
  title: "Giám đốc phát triển sản phẩm",
  visibleFields: defaultProfileVisibility,
  website: null,
  zalo: null,
});

describe("Profile Builder canvas boundary", () => {
  test("keeps the profile static while exposing block selection", () => {
    const markup = renderToStaticMarkup(
      <PublicProfile
        document={document}
        profile={{ ...profileDocumentToFlat(document), publicToken: "TEST" }}
        selection={{
          disabled: false,
          onSelect: vi.fn(),
          selectedBlock: "identity",
        }}
      />,
    );

    expect(markup).toContain('aria-label="Chỉnh sửa Avatar &amp; Cover"');
    expect(markup).not.toContain("data-selected");
    expect(markup).toContain("Private draft");
    expect(markup).toContain("profile-actions");
    expect(markup).toContain("data-preview-actions");
    expect(markup).toContain("Lưu liên hệ");
    expect(markup).toContain("Gọi");
    expect(markup).toContain("Chia sẻ");
    expect(markup).not.toContain("profile-inline-field");
    expect(markup).not.toContain("/vcard");
    expect(markup).not.toContain("mailto:");
    expect(markup).not.toContain("tel:");
    expect(markup).not.toContain("<input");
    expect(markup).not.toContain("<textarea");
  });
});
