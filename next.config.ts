import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "tensorlabtech-mhg-connect-media.s3.us-east-005.backblazeb2.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/api/internal/quotation-pdf": [
      "./private-assets/mhg-connect-outsource-quotation.pdf",
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
      {
        source: "/_demos/outsource-quotation",
        destination: "/_dev/demo-outsource-quotation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
