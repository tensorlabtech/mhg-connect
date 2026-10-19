import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a0a",
    description: "Hồ sơ số được kết nối từ QR định danh trên sản phẩm.",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icon-512.png",
        type: "image/png",
      },
    ],
    lang: "vi",
    name: "MHG Connect",
    orientation: "portrait-primary",
    short_name: "MHG Connect",
    start_url: "/",
    theme_color: "#0a0a0a",
  };
}
