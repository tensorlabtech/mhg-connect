import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const runtime = globalThis.process?.["env"] ?? {};
  if (
    runtime["NODE_ENV"] === "production" &&
    runtime["ENABLE_DEV_ROUTES"] !== "true"
  ) {
    return new Response("Not found", { status: 404 });
  }

  const file = await readFile(
    join(
      globalThis.process.cwd(),
      "private-assets",
      "mhg-connect-outsource-quotation.pdf",
    ),
  );
  return new Response(file, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="mhg-connect-quotation.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
