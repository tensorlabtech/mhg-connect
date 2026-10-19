import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { QrVisualCard } from "./qr-visual-card";
import {
  MHG_LOGO_URL,
  MHG_CARD_LOGO_URL,
} from "@/features/enterprise/enterprise-branding";
import { QR_CARD_DEFAULT_TAGLINE } from "./qr-card-layout";
import { QrCardLayoutFields } from "./qr-card-layout-fields";

const svg =
  '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="white" /></svg>';
describe("shared business card rendering", () => {
  it("keeps the fixed brand and shield on their own contrast plates even on a cleared card", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Gốc"
        svg={svg}
        appearance={{
          showAvatar: false,
          showEnterpriseLogo: false,
          copy: {
            name: "",
            title: "",
            company: "",
            phone: "",
            website: "",
            location: "",
          },
        }}
      />,
    );
    expect(html).not.toContain("Gốc");
    expect(html).toContain('data-brand-plate="logo"');
    expect(html).toContain('data-brand-plate="protection"');
    expect(html).toContain("lucide-shield-check");
    expect(html).toContain(MHG_CARD_LOGO_URL);
    expect(html).toContain(QR_CARD_DEFAULT_TAGLINE);
    expect(html).toContain(svg);
    expect(html).not.toContain("data-placeholder");
  });
  it("does not offer a toggle or input for the fixed brand line in older layout controls", () => {
    const html = renderToStaticMarkup(
      <QrCardLayoutFields
        idPrefix="locked"
        orientation="landscape"
        tagline=""
        onOrientationChange={() => {}}
        onTaglineCommit={() => {}}
      />,
    );
    expect(html).toContain(QR_CARD_DEFAULT_TAGLINE);
    expect(html).not.toContain('role="switch"');
    expect(html).not.toContain("<input");
  });
  it("always renders the uneditable required brand line, ignoring blank or custom legacy text", () => {
    for (const tagline of [undefined, null, "", "Nội dung thay thế"]) {
      const html = renderToStaticMarkup(
        <QrVisualCard heading="Kiểm thử" svg={svg} tagline={tagline} />,
      );
      expect(html).toContain(QR_CARD_DEFAULT_TAGLINE);
      expect(html).not.toContain("Nội dung thay thế");
      expect(html).toContain('data-fixed-mhg-tagline="true"');
    }
  });
  it("uses the crisp card logo without duplicating the homepage brand fallback", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard heading="Kiểm thử" svg={svg} logoUrl={MHG_LOGO_URL} />,
    );
    expect(html).toContain(MHG_CARD_LOGO_URL);
    expect(html).not.toContain('class="digital-card-enterprise-logo"');
  });
  it("renders profile photo framing consistently without using an old card photo", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Hồ sơ"
        svg={svg}
        identity={{ avatarUrl: "/profile.png" }}
        appearance={{
          avatarUrl: "/legacy-card.png",
          avatarCrop: { x: 30, y: 70, zoom: 2 },
        }}
      />,
    );
    expect(html).toContain('src="/profile.png"');
    expect(html).not.toContain("/legacy-card.png");
    expect(html).toContain("object-position:30% 70%");
    expect(html).toContain("transform:scale(2)");
  });
  it("uses a lighter default photo veil without fading card content", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Tên rõ nét"
        svg={svg}
        backgroundUrl="/photo.png"
      />,
    );
    expect(html).toContain(
      'class="digital-card-photo-shade" aria-hidden="true" style="opacity:0.4"',
    );
    expect(html).toContain("Tên rõ nét");
    expect((html.match(/opacity:/g) ?? []).length).toBe(1);
  });
  it("honors zero and full photo dimming in dark and ivory templates", () => {
    for (const finish of ["signature", "ivory"] as const)
      for (const backgroundDim of [0, 100]) {
        const html = renderToStaticMarkup(
          <QrVisualCard
            heading="Kiểm thử"
            svg={svg}
            backgroundUrl="/photo.png"
            appearance={{ finish, backgroundDim }}
          />,
        );
        expect(html).toContain(`style="opacity:${backgroundDim / 100}"`);
      }
  });
  it("provides a local sizing container even without an interactive wrapper", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard heading="Kiểm thử" svg={svg} />,
    );
    expect(html).toContain('<div class="business-card-size"><section');
    const css = readFileSync(
      path.join(process.cwd(), "src/features/qr/digital-identity-card.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.business-card-size\s*\{[^}]*container-type:\s*inline-size/s,
    );
  });
  it("keeps the fixed MHG mark alongside an additional enterprise logo", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Nguyễn Minh An"
        svg={svg}
        logoUrl="/brand/enterprise.png"
        logoName="Doanh nghiệp"
        tagline=""
      />,
    );
    expect(html).toContain(MHG_CARD_LOGO_URL);
    expect(html).toContain("/brand/enterprise.png");
    expect(html).toContain("data-fixed-mhg-logo");
    expect(html).not.toContain("bg-white");
  });
  it("allows hiding only the optional enterprise logo, not MHG", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Kiểm thử"
        svg={svg}
        logoUrl="/brand/enterprise.png"
        appearance={{ showEnterpriseLogo: false }}
      />,
    );
    expect(html).toContain(MHG_CARD_LOGO_URL);
    expect(html).not.toContain("/brand/enterprise.png");
  });
  it("drops MHG only when an admin-granted enterprise shows its own logo", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Nguyễn Văn Thanh"
        svg={svg}
        logoUrl="/brand/enterprise.png"
        logoName="Cơ quan"
        hideMhgLogo
      />,
    );
    expect(html).not.toContain(MHG_CARD_LOGO_URL);
    expect(html).not.toContain("data-fixed-mhg-logo");
    expect(html).toContain("data-enterprise-only-logo");
    expect(html).toContain("/brand/enterprise.png");
  });
  it("never leaves a card without a brand: MHG stays when no enterprise logo is shown", () => {
    for (const props of [
      { logoUrl: MHG_LOGO_URL },
      { logoUrl: "/brand/enterprise.png", appearance: { showEnterpriseLogo: false } },
    ]) {
      const html = renderToStaticMarkup(
        <QrVisualCard heading="Kiểm thử" svg={svg} hideMhgLogo {...props} />,
      );
      expect(html).toContain(MHG_CARD_LOGO_URL);
    }
  });
  it("prints as a square-cornered card and keeps multi-line titles", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/features/qr/digital-identity-card.css"),
      "utf8",
    );
    expect(css).toMatch(/\.digital-identity-card\s*\{[^}]*border-radius:\s*0;/s);
    expect(css).toMatch(/\.digital-card-title\s*\{[^}]*white-space:\s*pre-line/s);
  });
  it("uses saved card copy, avatar and layout without replacing the QR", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading="Hồ sơ gốc"
        svg={svg}
        identity={{ avatarUrl: "/avatar.png", phone: "0900000000" }}
        appearance={{ copy: { name: "Tên trên thẻ" }, finish: "ivory" }}
        orientation="landscape"
        position="left"
      />,
    );
    expect(html).toContain("Tên trên thẻ");
    expect(html).not.toContain("Hồ sơ gốc");
    expect(html).toContain("/avatar.png");
    expect(html).toContain('data-card-position="left"');
    expect(html).toContain(svg);
    expect(html).toContain('data-card-finish="ivory"');
  });
  it("escapes text and never turns unsafe website text into a script link", () => {
    const html = renderToStaticMarkup(
      <QrVisualCard
        heading={"<script>alert(1)</script>"}
        svg={svg}
        identity={{ website: "javascript:alert(1)" }}
      />,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('href="javascript:');
  });
  it("uses a real alpha PNG for the fixed brand asset", () => {
    const file = readFileSync(
      path.join(process.cwd(), "public", MHG_CARD_LOGO_URL),
    );
    expect([...file.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(file[25]).toBe(6);
  });
});
