import type { Metadata } from "next";

import DemoProfilePage from "@/features/dev/demo-profile/demo-profile-page";
import { guardDevRoute } from "@/features/dev/dev-route-guard";
import { profileStylePacks } from "@/features/profile/profile-style-packs";

export const metadata: Metadata = {
  title: "Nguyễn Minh Anh | Studio độc lập",
  robots: { index: false, follow: false },
};

export default async function DemoProfileRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  guardDevRoute();
  const query = await searchParams;
  const requestedStyle = Array.isArray(query.style)
    ? query.style[0]
    : query.style;
  const normalizedStyle =
    requestedStyle === "bach-khoa" ? "wikipedia" : requestedStyle;
  const styleId =
    profileStylePacks.find((style) => style.id === normalizedStyle)?.id ??
    "studio-light";

  return <DemoProfilePage styleId={styleId} />;
}
