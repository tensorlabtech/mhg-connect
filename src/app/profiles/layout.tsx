import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Hồ sơ",
};

export default function ProfilesLayout({ children }: { children: ReactNode }) {
  return children;
}
