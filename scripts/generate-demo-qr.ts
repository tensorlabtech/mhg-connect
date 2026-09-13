import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";

const runtime = globalThis.process?.["env"] ?? {};
const configuredUrl = runtime["APP_URL"];
if (!configuredUrl) {
  throw new Error("APP_URL is required to generate QR artifacts.");
}
const parsedUrl = new URL(configuredUrl);
if (runtime["RELEASE_QR"] === "true" && parsedUrl.protocol !== "https:") {
  throw new Error("Release QR artifacts require an HTTPS APP_URL.");
}
const baseUrl = parsedUrl.toString().replace(/\/$/, "");
const outputDirectory = resolve("public/demo-qr");
const tokens = ["DEMO-NEW", "DEMO-ACTIVE", "DEMO-LOCKED"];

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  for (const token of tokens) {
    await QRCode.toFile(
      resolve(outputDirectory, `${token.toLowerCase()}.png`),
      `${baseUrl}/q/${token}`,
      {
        color: { dark: "#0a0a0a", light: "#ffffff" },
        errorCorrectionLevel: "H",
        margin: 3,
        width: 1024,
      },
    );
  }

  console.info(`Generated ${tokens.length} QR images for ${baseUrl}.`);
}

main().catch((error) => {
  console.error(error);
  globalThis.process.exitCode = 1;
});
