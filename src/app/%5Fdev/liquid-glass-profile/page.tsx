import type { Metadata } from "next";

import { profile } from "@/features/dev/demo-profile/demo-profile-data";
import {
  LiquidGlassProfilePrototype,
  type LiquidProfilePrototypeData,
  type LiquidProfilePrototypeVariant,
} from "@/features/dev/liquid-glass-profile/liquid-glass-profile-prototype";
import { guardDevRoute } from "@/features/dev/dev-route-guard";

export const metadata: Metadata = {
  title: "Liquid Glass Profile Prototype",
  robots: { follow: false, index: false },
};

const fullProfile: LiquidProfilePrototypeData = {
  avatarUrl: profile.image,
  bio: profile.bio,
  company: profile.company,
  contactEmail: profile.email,
  coverUrl: profile.coverImage,
  location: profile.location,
  name: profile.name,
  phone: profile.phone,
  socials: [
    {
      href: "https://zalo.me/84912345678",
      iconPath: "/icons/social/zalo.svg",
      label: "Zalo",
      value: profile.phone,
    },
    {
      href: "https://facebook.com/minhanh.profile",
      iconPath: "/icons/social/facebook.svg",
      label: "Facebook",
      value: "minhanh.profile",
    },
    {
      href: "https://instagram.com/minhanh.profile",
      iconPath: "/icons/social/instagram.svg",
      label: "Instagram",
      value: "@minhanh.profile",
    },
    {
      href: "https://www.linkedin.com/in/minhanh-profile",
      iconPath: "/icons/social/linkedin.svg",
      label: "LinkedIn",
      value: "minhanh-profile",
    },
    {
      href: "https://github.com/minhanh-profile",
      iconPath: "/icons/social/github.svg",
      label: "GitHub",
      value: "minhanh-profile",
    },
    {
      href: "https://t.me/minhanh_profile",
      iconPath: "/icons/social/telegram.svg",
      label: "Telegram",
      value: "@minhanh_profile",
    },
  ],
  title: profile.role,
  website: profile.websiteHref,
};

const variants: Record<
  LiquidProfilePrototypeVariant,
  LiquidProfilePrototypeData
> = {
  full: fullProfile,
  "no-media": { ...fullProfile, avatarUrl: null, coverUrl: null },
  sparse: {
    ...fullProfile,
    bio: null,
    company: null,
    contactEmail: null,
    coverUrl: null,
    location: null,
    socials: fullProfile.socials.slice(0, 2),
    website: null,
  },
};

export default async function LiquidGlassProfilePrototypeRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  guardDevRoute();
  const query = await searchParams;
  const requestedVariant = Array.isArray(query.variant)
    ? query.variant[0]
    : query.variant;
  const variant: LiquidProfilePrototypeVariant =
    requestedVariant === "sparse" || requestedVariant === "no-media"
      ? requestedVariant
      : "full";

  return (
    <LiquidGlassProfilePrototype data={variants[variant]} variant={variant} />
  );
}
