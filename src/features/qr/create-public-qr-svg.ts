import QRCode from "qrcode";

import { runtimeEnv } from "@/lib/runtime-env";

export async function createPublicQrSvg(token: string) {
  const baseUrl = runtimeEnv.authUrl ?? "http://localhost:3000";
  const publicUrl = new URL(`/q/${encodeURIComponent(token)}`, baseUrl);

  return QRCode.toString(publicUrl.toString(), {
    color: { dark: "#0a0a0a", light: "#ffffff" },
    errorCorrectionLevel: "H",
    margin: 4,
    type: "svg",
  });
}
