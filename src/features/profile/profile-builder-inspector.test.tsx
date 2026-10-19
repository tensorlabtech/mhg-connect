import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileBuilderInspector } from "@/features/profile/profile-builder-inspector";
import { createProfileDocument } from "@/features/profile/profile-document";
import { profileStylePacks } from "@/features/profile/profile-style-packs";

vi.mock("@/features/profile/profile-article-actions", () => ({
  uploadArticleImageAction: vi.fn(),
}));

const document = createProfileDocument({
  avatarUrl: null,
  bio: "Giới thiệu ngắn",
  company: "MHG",
  contactEmail: "user@example.test",
  coverUrl: null,
  linkedIn: "https://linkedin.com/in/minh-anh",
  location: "Hà Nội",
  name: "Nguyễn Minh Anh",
  phone: "+84 912 345 678",
  status: "draft",
  telegram: "@minhanh",
  template: "cover",
  title: "Giám đốc phát triển sản phẩm",
  visibleFields: defaultProfileVisibility,
  website: "https://mhg.vn",
  zalo: "84912345678",
});

function renderInspector(
  selection: "bio" | "contact" | "document" | "identity" | "social",
) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <ProfileBuilderInspector
        document={document}
        onChange={vi.fn()}
        selection={selection}
      />
    </TooltipProvider>,
  );
}

describe("ProfileBuilderInspector fields", () => {
  test("renders identity and bio values in sidebar controls", () => {
    const identity = renderInspector("identity");

    expect(identity).toContain('value="Nguyễn Minh Anh"');
    expect(identity).toContain("Ảnh đại diện");
    expect(identity).toContain("Ảnh bìa");
    expect(renderInspector("bio")).toContain("Giới thiệu ngắn");
  });

  test("renders contact and social values in sidebar controls", () => {
    const contact = renderInspector("contact");
    const social = renderInspector("social");

    expect(contact).toContain('value="user@example.test"');
    expect(contact).toContain('value="+84 912 345 678"');
    expect(contact).toContain('value="https://mhg.vn"');
    expect(social).toContain('value="84912345678"');
    expect(social).toContain('value="https://linkedin.com/in/minh-anh"');
    expect(social).toContain('value="@minhanh"');
    expect(social).toContain("Facebook");
    expect(social).toContain("Instagram");
    expect(social).toContain("TikTok");
    expect(social).toContain("YouTube");
    expect(social).toContain("GitHub");
    expect(social).not.toContain("Phổ biến");
    expect(social).not.toContain("Nội dung");
  });

  test("presents complete style packs with visual thumbnails", () => {
    const settings = renderInspector("document");

    expect(settings).toContain("Chữ ký đêm");
    expect(settings).toContain("Dòng sáng");
    expect(settings).toContain("Tối giản");
    expect(settings).toContain("Bách khoa");
    expect(settings).toContain("Lưới biên tập");
    expect(settings).toContain("Điện ảnh");
    expect(settings).toContain("Mở thư viện nền");
    expect(settings).toContain("profile-style-thumbnail");
    expect(settings).toContain(
      "%2Fimages%2Fprofile-style-thumbnails%2Fsignature-dark.webp",
    );
    expect(profileStylePacks.map((style) => style.thumbnailUrl)).toEqual([
      "/images/profile-style-thumbnails/signature-dark.webp",
      "/images/profile-style-thumbnails/studio-light.webp",
      "/images/profile-style-thumbnails/minimal-mono.webp",
      "/images/profile-style-thumbnails/wikipedia.svg",
      "/images/profile-style-thumbnails/creator-bold.webp",
      "/images/profile-style-thumbnails/cinematic.webp",
    ]);
  });
});
