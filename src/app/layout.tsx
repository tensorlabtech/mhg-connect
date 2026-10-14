import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import { runtimeEnv } from "@/lib/runtime-env";

import "@/app/globals.css";
import "@/features/profile/public-profile-style-packs.css";
import "@/features/profile/public-profile-wikipedia-style.css";
import "@/features/profile/public-profile-article.css";
import "@/features/profile/public-profile-inline-edit.css";

export const metadata: Metadata = {
  applicationName: "MHG Connect",
  category: "technology",
  description:
    "MHG Connect biến mỗi tem QR thành một hồ sơ số có thể cập nhật, chia sẻ và quản lý lâu dài.",
  formatDetection: { address: false, email: false, telephone: false },
  icons: {
    apple: [{ sizes: "180x180", url: "/apple-touch-icon.png" }],
    icon: [
      { type: "image/svg+xml", url: "/favicon.svg" },
      { sizes: "192x192", type: "image/png", url: "/icon-192.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(runtimeEnv.authUrl ?? "http://localhost:3000"),
  openGraph: {
    description:
      "Kết nối sản phẩm với con người bằng hồ sơ số từ QR định danh.",
    images: [
      {
        alt: "MHG Connect — Kết nối sản phẩm với con người",
        height: 630,
        url: "/og-image.png",
        width: 1200,
      },
    ],
    locale: "vi_VN",
    siteName: "MHG Connect",
    title: "MHG Connect — Hồ sơ số từ QR định danh",
    type: "website",
  },
  title: {
    default: "MHG Connect — Hồ sơ số từ QR định danh",
    template: "%s | MHG Connect",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Kết nối sản phẩm với con người bằng hồ sơ số từ QR định danh.",
    images: ["/og-image.png"],
    title: "MHG Connect — Hồ sơ số từ QR định danh",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html className="dark" data-scroll-behavior="smooth" lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
