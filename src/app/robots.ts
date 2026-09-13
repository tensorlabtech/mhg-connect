import type { MetadataRoute } from "next";

import { runtimeEnv } from "@/lib/runtime-env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = runtimeEnv.authUrl ?? "http://localhost:3000";

  return {
    host: baseUrl,
    rules: {
      allow: ["/", "/q/"],
      disallow: [
        "/_dev",
        "/admin",
        "/api",
        "/dashboard",
        "/login",
        "/profiles",
        "/register",
      ],
      userAgent: "*",
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
