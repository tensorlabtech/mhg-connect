import type { NextConfig } from "next";

function configuredB2PublicUrl() {
  try {
    let publicUrl: URL;
    if (process.env.B2_PUBLIC_URL_BASE) {
      publicUrl = new URL(process.env.B2_PUBLIC_URL_BASE);
    } else {
      const bucket = process.env.B2_BUCKET_NAME;
      const endpoint = process.env.B2_S3_ENDPOINT;
      if (!bucket || !endpoint) return null;
      publicUrl = new URL(endpoint);
      const hostname = `${bucket}.${publicUrl.hostname}`;
      publicUrl.hostname = hostname;
      if (publicUrl.hostname !== hostname) return null;
    }
    if (
      publicUrl.protocol !== "https:" ||
      !publicUrl.hostname ||
      publicUrl.username ||
      publicUrl.password
    ) {
      return null;
    }
    return publicUrl;
  } catch {
    return null;
  }
}

const b2PublicUrl = configuredB2PublicUrl();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(b2PublicUrl
        ? [
            {
              protocol: "https" as const,
              hostname: b2PublicUrl.hostname,
              port: b2PublicUrl.port,
              pathname: "/**",
              search: "",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  // Local personal drafts must never be packaged with a deployable server build.
  outputFileTracingExcludes: {
    "/*": ["./.local-drafts/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/_dev/desisn-system",
        destination: "/_dev/design-system",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
