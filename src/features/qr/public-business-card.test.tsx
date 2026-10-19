import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PublicBusinessCard } from "./public-business-card";

const svg =
  '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="white" /></svg>';

describe("public profile 3D business card", () => {
  it("shows the same saved card design as the dashboard", () => {
    const html = renderToStaticMarkup(
      <PublicBusinessCard
        qr={{
          cardAppearance: { finish: "signature", copy: { name: "Tên trên thẻ" } },
          cardBackgroundUrl: "/brand/card-backgrounds/dat-nuoc-sen-doc.jpg",
          cardFont: "manrope",
          cardOrientation: "portrait",
          cardPosition: "left",
          cardTagline: "Bảo vệ khỏi virus, vi khuẩn và nấm",
          cardTextColor: null,
          cardTextStyle: "shadow",
        }}
        identity={{
          name: "Nguyễn Văn Thanh",
          title: "Ủy viên Đoàn Chủ tịch\nTrưởng ban Dân tộc và Tôn giáo",
          company: "Ủy ban Trung ương MTTQ Việt Nam",
          location: "Hà Nội",
        }}
        svg={svg}
      />,
    );
    expect(html).toContain('data-card-orientation="portrait"');
    expect(html).toContain('data-card-position="left"');
    expect(html).toContain("dat-nuoc-sen-doc.jpg");
    expect(html).toContain("Tên trên thẻ");
    expect(html).toContain("Trưởng ban Dân tộc và Tôn giáo");
    expect(html).toContain("Hà Nội");
    expect(html).toContain("data-card-interactive");
    expect(html).toContain("max-w-sm");
  });
  it("keeps the card's own link colour inside themed profile pages", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/features/qr/digital-identity-card.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.digital-identity-card\[data-digital-identity-card\] \.digital-card-contacts a[^{]*\{[^}]*color:\s*inherit/s,
    );
  });
});
