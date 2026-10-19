# Architecture

One Next.js App Router application owns rendering, Server Actions and Route Handlers. PostgreSQL is the source of truth; Drizzle schemas and migrations live in [`src/db/schema`](../src/db/schema) and [`drizzle`](../drizzle). Better Auth owns email/password authentication and sessions.

An account may own multiple QR codes and profiles. A QR references a published profile belonging to the same owner. Profiles resolve through `/q/[token]`; reset removes the QR assignment without deleting the profile. Published JSON snapshots and optimistic version checks protect profile reads and saves.

Shared renderers serve profile editing, public display, card previews and printing. Enterprise membership controls optional company branding; this is not a complete multi-tenant authorization model.

[`src/lib/profile-media-storage.ts`](../src/lib/profile-media-storage.ts) owns B2 media, a legacy Blob fallback and an optional local development mode. Private local drafts require development and a loopback host and must not be deployed.

Server-side session/ownership checks protect mutation and administration. Dev catalogues are disabled in production unless explicitly enabled. Source and tests own the executable contracts.
