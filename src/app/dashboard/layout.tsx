import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Bảng điều khiển",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
