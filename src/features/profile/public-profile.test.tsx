import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import { createProfileDocument } from "@/features/profile/profile-document";
import { PublicProfile } from "@/features/profile/public-profile";

const profile = {
  avatarUrl: null,
  bio: null,
  company: "MHG",
  contactEmail: null,
  coverUrl: null,
  linkedIn: null,
  location: null,
  name: "Nguyen Minh Anh",
  phone: null,
  publicToken: "TEST",
  telegram: null,
  template: "minimal" as const,
  title: null,
  visibleFields: defaultProfileVisibility,
  website: null,
  zalo: null,
};

describe("PublicProfile renderer boundary", () => {
  test("keeps editor controls out of public markup and omits a stray byline separator", () => {
    const markup = renderToStaticMarkup(<PublicProfile profile={profile} />);

    expect(markup).toContain("profile-actions");
    expect(markup).toContain('data-has-avatar="false"');
    expect(markup).toContain('data-has-cover="false"');
    expect(markup).not.toContain("Gọi");
    expect(markup).not.toContain("Giới thiệu");
    expect(markup).not.toContain("Thông tin liên hệ");
    expect(markup).not.toContain("Mạng xã hội");
    expect(markup).not.toContain("profile-inline-field");
    expect(markup).not.toContain("profile-editor-block");
    expect(markup).not.toContain(">·<");
  });

  test("renders inline controls only through the editor adapter", () => {
    const document = createProfileDocument({ ...profile, status: "draft" });
    const markup = renderToStaticMarkup(
      <PublicProfile
        document={document}
        editor={{
          disabled: false,
          invalidField: null,
          onChange: vi.fn(),
          onFocus: vi.fn(),
          onSelect: vi.fn(),
          selectedBlock: "identity",
        }}
        preview
        profile={profile}
      />,
    );

    expect(markup).toContain("profile-inline-field");
    expect(markup).toContain("profile-editor-block");
  });

  test("can hide public actions without enabling preview or editor chrome", () => {
    const markup = renderToStaticMarkup(
      <PublicProfile profile={profile} showActions={false} />,
    );

    expect(markup).not.toContain("profile-actions");
    expect(markup).not.toContain("profile-page-preview");
    expect(markup).not.toContain("profile-editor-block");
  });

  test("keeps selection actions inert while preserving local article navigation", () => {
    const document = createProfileDocument({ ...profile, status: "draft" });
    const markup = renderToStaticMarkup(
      <PublicProfile
        document={document}
        profile={profile}
        selection={{
          disabled: false,
          onSelect: vi.fn(),
          selectedBlock: "identity",
        }}
        showActions={false}
      />,
    );

    expect(markup).not.toContain("<a ");
    expect(markup).not.toContain("<input");
    expect(markup).not.toContain("<textarea");
    expect(markup.match(/role="button"/g)).toHaveLength(1);
    expect(markup).not.toContain("Chỉnh sửa Thông tin liên hệ");
    expect(markup).not.toContain("Chỉnh sửa Mạng xã hội");
  });

  test("preserves persisted field visibility on the public profile", () => {
    const filledProfile = {
      ...profile,
      contactEmail: "hidden@example.test",
      visibleFields: { ...defaultProfileVisibility, email: false },
    };
    const document = createProfileDocument({
      ...filledProfile,
      status: "published" as const,
    });
    const markup = renderToStaticMarkup(
      <PublicProfile document={document} profile={filledProfile} />,
    );

    expect(markup).not.toContain("hidden@example.test");
  });

  test("renders added social platforms with local brand icons", () => {
    const document = createProfileDocument({ ...profile, status: "published" });
    const socialDocument = {
      ...document,
      blocks: document.blocks.map((block) =>
        block.type === "social"
          ? {
              ...block,
              data: {
                ...block.data,
                facebook: "mhg.connect",
                visibleFields: {
                  ...block.data.visibleFields,
                  facebook: true,
                },
              },
            }
          : block,
      ),
    } as typeof document;
    const markup = renderToStaticMarkup(
      <PublicProfile document={socialDocument} profile={profile} />,
    );

    expect(markup).toContain('href="https://facebook.com/mhg.connect"');
    expect(markup).toContain("/icons/social/facebook.svg");
  });

  test("renders the selected style and background as profile-scoped state", () => {
    const document = createProfileDocument({ ...profile, status: "published" });
    document.theme = {
      background: { presetId: "forest", type: "preset" },
      headerLayout: "minimal",
      themeId: "wikipedia",
    };

    const markup = renderToStaticMarkup(
      <PublicProfile document={document} profile={profile} />,
    );

    expect(markup).toContain('data-style="wikipedia"');
    expect(markup).toContain('data-background="forest"');
  });

  test("keeps the living surface scoped to the Dòng sáng style background", () => {
    const styleDocument = createProfileDocument({
      ...profile,
      status: "published",
    });
    styleDocument.theme = {
      background: { type: "style" },
      headerLayout: "minimal",
      themeId: "studio-light",
    };

    const styleMarkup = renderToStaticMarkup(
      <PublicProfile document={styleDocument} profile={profile} />,
    );

    expect(styleMarkup).toContain("profile-living-surface");
    expect(styleMarkup).toContain("profile-identity-actions");

    const customBackgroundDocument = {
      ...styleDocument,
      theme: {
        ...styleDocument.theme,
        background: { presetId: "paper", type: "preset" as const },
      },
    };
    const customBackgroundMarkup = renderToStaticMarkup(
      <PublicProfile document={customBackgroundDocument} profile={profile} />,
    );

    expect(customBackgroundMarkup).not.toContain("profile-living-surface");
  });

  test("renders encyclopedia-style navigation only for visible profile sections", () => {
    const wikipediaDocument = createProfileDocument({
      ...profile,
      bio: "Một hồ sơ ngắn.",
      location: "Hà Nội",
      phone: "0901234567",
      status: "published",
      title: "Giám đốc sản phẩm",
    });
    wikipediaDocument.theme = {
      background: { type: "style" },
      headerLayout: "minimal",
      themeId: "wikipedia",
    };

    const markup = renderToStaticMarkup(
      <PublicProfile document={wikipediaDocument} profile={profile} />,
    );

    expect(markup).not.toContain("profile-wikipedia-notice");
    expect(markup).not.toContain("profile-wikipedia-masthead");
    expect(markup).toContain('href="#profile-identity"');
    expect(markup).toContain('href="#profile-contact"');
    expect(markup).not.toContain('href="#profile-social"');
    expect(markup).toContain('aria-current="location"');
    expect(markup.match(/Giám đốc sản phẩm/g)).toHaveLength(1);
    expect(markup.match(/Hà Nội/g)).toHaveLength(1);
    expect(markup.match(/id="profile-contact"/g)).toHaveLength(1);
    expect(markup.match(/data-profile-section="contact"/g)).toHaveLength(1);
    expect(markup).toContain("profile-wikipedia-infobox-actions");
    expect(markup).toContain("Powered by");
    expect(markup).toContain("MHG Connect");
    expect(markup).not.toContain("Hồ sơ số cá nhân");
    expect(markup).not.toContain("Wikipedia");
    expect(markup).not.toContain("Tạo tài khoản");
    expect(markup).not.toContain("Đăng nhập");
    expect(markup).not.toContain("Tiếng Việt");

    const hiddenContactDocument = {
      ...wikipediaDocument,
      blocks: wikipediaDocument.blocks.map((block) =>
        block.type === "contact" ? { ...block, visible: false } : block,
      ),
    } as typeof wikipediaDocument;
    const hiddenContactMarkup = renderToStaticMarkup(
      <PublicProfile document={hiddenContactDocument} profile={profile} />,
    );
    expect(hiddenContactMarkup).not.toContain('id="profile-contact"');
    expect(hiddenContactMarkup).not.toContain("0901234567");

    const selectionMarkup = renderToStaticMarkup(
      <PublicProfile
        document={wikipediaDocument}
        profile={profile}
        selection={{
          disabled: false,
          onSelect: vi.fn(),
          selectedBlock: "identity",
        }}
        showActions={false}
      />,
    );
    expect(selectionMarkup).not.toContain("<a ");

    const sparseDocument = createProfileDocument({
      ...profile,
      status: "published",
    });
    sparseDocument.theme = wikipediaDocument.theme;
    const sparseMarkup = renderToStaticMarkup(
      <PublicProfile document={sparseDocument} profile={profile} />,
    );

    expect(sparseMarkup).toContain('data-has-avatar="false"');
    expect(sparseMarkup).toContain('href="#profile-identity"');
    expect(sparseMarkup).not.toContain('href="#profile-contact"');
    expect(sparseMarkup).not.toContain('href="#profile-social"');
  });
});
