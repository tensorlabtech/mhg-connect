import { notFound } from "next/navigation"

export function guardDevRoute() {
  const runtime = globalThis.process?.["env"] ?? {}
  if (runtime["NODE_ENV"] === "production" && runtime["ENABLE_DEV_ROUTES"] !== "true") {
    notFound()
  }
}
