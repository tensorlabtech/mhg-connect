import { describe, expect, it } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import { buildVCard } from "@/features/profile/vcard";

describe("buildVCard", () => {
  it("includes visible contact fields and omits hidden fields", () => {
    const card = buildVCard({
      avatarUrl: null,
      coverUrl: null,
      bio: null,
      company: "MHG",
      contactEmail: "hello@mhg.vn",
      linkedIn: null,
      location: "Hà Nội",
      name: "Minh Anh",
      phone: "0901 234 567",
      publicToken: "DEMO-ACTIVE",
      telegram: null,
      template: "cover",
      title: "Giám đốc",
      visibleFields: { ...defaultProfileVisibility, email: false },
      website: "https://mhg.vn",
      zalo: null,
    });

    expect(card).toContain("FN:Minh Anh");
    expect(card).toContain("TEL;TYPE=CELL:0901 234 567");
    expect(card).not.toContain("hello@mhg.vn");
  });

  it("escapes vCard control characters in public fields", () => {
    const card = buildVCard({
      avatarUrl: null,
      coverUrl: null,
      bio: null,
      company: "MHG, Connect; Lab",
      contactEmail: null,
      linkedIn: null,
      location: "Hà Nội\nViệt Nam",
      name: "Minh \\ Anh",
      phone: null,
      publicToken: "DEMO-ACTIVE",
      telegram: null,
      template: "minimal",
      title: "Product; Lead",
      visibleFields: defaultProfileVisibility,
      website: null,
      zalo: null,
    });

    expect(card).toContain("FN:Minh \\\\ Anh");
    expect(card).toContain("ORG:MHG\\, Connect\\; Lab");
    expect(card).toContain("TITLE:Product\\; Lead");
    expect(card).toContain("ADR:;;Hà Nội\\nViệt Nam;;;;");
    expect(card.split("\r\n")).toEqual(
      expect.arrayContaining(["BEGIN:VCARD", "VERSION:3.0", "END:VCARD"]),
    );
  });
});
