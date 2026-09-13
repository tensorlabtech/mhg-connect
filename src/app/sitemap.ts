import type { MetadataRoute } from "next";

import { runtimeEnv } from "@/lib/runtime-env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = runtimeEnv.authUrl ?? "http://localhost:3000";

  return [
    {
      changeFrequency: "monthly",
      priority: 1,
      url: new URL("/", baseUrl).toString(),
    },
  ];
}
