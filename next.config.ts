import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/internal/quotation-pdf": [
      "./private-assets/mhg-connect-outsource-quotation.pdf",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
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
