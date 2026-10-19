import "./load-local-env";

import { eq, inArray, sql } from "drizzle-orm";

import { closeDatabase, db } from "../src/db";
import {
  defaultProfileVisibility,
  profiles,
  qrCodes,
  scanEvents,
  session as authSession,
  user,
} from "../src/db/schema";
import { createProfileDocument } from "../src/features/profile/profile-document";
import { auth } from "../src/lib/auth";

const runtime = globalThis.process?.["env"] ?? {};

function required(name: string) {
  const value = runtime[name];
  if (!value) throw new Error(`${name} is required to seed demo data.`);
  return value;
}

async function ensureAccount(
  email: string,
  password: string,
  name: string,
  role: "admin" | "user",
) {
  const revokeSession = async (token: string | null | undefined) => {
    if (token) {
      await db.delete(authSession).where(eq(authSession.token, token));
    }
  };
  let [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  const existedBeforeSeed = Boolean(existing);
  if (!existing) {
    const signUpResult = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    await revokeSession(signUpResult.token);
    [existing] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
  }
  if (!existing) throw new Error(`Could not create account for ${email}.`);
  if (existedBeforeSeed) {
    let signInToken: string | null | undefined;
    try {
      const signInResult = await auth.api.signInEmail({
        body: { email, password },
      });
      signInToken = signInResult.token;
    } catch {
      throw new Error(
        `Existing account ${email} does not match the configured seed password.`,
      );
    }
    await revokeSession(signInToken);
  }
  if (existing.role !== role) {
    [existing] = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, existing.id))
      .returning();
  }
  return existing;
}

async function main() {
  const adminEmail = required("ADMIN_EMAIL").trim().toLowerCase();
  const admin = await ensureAccount(
    adminEmail,
    required("ADMIN_PASSWORD"),
    runtime["ADMIN_NAME"] || "MHG Admin",
    "admin",
  );
  const demoEmail = runtime["DEMO_USER_EMAIL"]?.trim().toLowerCase();
  const demoPassword = runtime["DEMO_USER_PASSWORD"];
  if (Boolean(demoEmail) !== Boolean(demoPassword)) {
    throw new Error(
      "DEMO_USER_EMAIL and DEMO_USER_PASSWORD must be provided together.",
    );
  }
  if (demoEmail === adminEmail) {
    throw new Error("DEMO_USER_EMAIL must be different from ADMIN_EMAIL.");
  }
  const owner =
    demoEmail && demoPassword
      ? await ensureAccount(demoEmail, demoPassword, "Nguyễn Minh Anh", "user")
      : admin;

  await db
    .update(qrCodes)
    .set({
      activeProfileId: null,
      activatedAt: null,
      ownerId: null,
      status: "available",
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      inArray(qrCodes.publicToken, ["DEMO-NEW", "DEMO-ACTIVE", "DEMO-LOCKED"]),
    );

  const demoProfileId = "00000000-0000-4000-8000-000000000001";
  const baseDemoProfileDocument = createProfileDocument({
    avatarUrl: "/images/demo-profile-nguyen-minh-anh.png",
    bio: "Tôi thiết kế sản phẩm số, xây dựng trải nghiệm rõ ràng và biến ý tưởng thành những giải pháp có thể sử dụng trong thực tế.",
    company: "Studio độc lập",
    contactEmail: "hello@example.com",
    coverUrl: "/images/demo-profile-qr-cover.png",
    linkedIn: "https://linkedin.com/in/minhanh-profile",
    location: "Việt Nam",
    name: "Nguyễn Minh Anh",
    phone: "+84 912 345 678",
    status: "published",
    telegram: "@minhanh_profile",
    template: "cover",
    title: "Nhà thiết kế sản phẩm",
    visibleFields: defaultProfileVisibility,
    website: "https://example.com/minh-anh",
    zalo: "84912345678",
  });
  const demoProfileDocument = {
    ...baseDemoProfileDocument,
    blocks: baseDemoProfileDocument.blocks.map((block) =>
      block.type === "social"
        ? {
            ...block,
            data: {
              ...block.data,
              facebook: "https://facebook.com/minhanh.profile",
              github: "https://github.com/minhanh-profile",
              instagram: "@minhanh.profile",
              tiktok: "@minhanh.profile",
              x: "@minhanh_profile",
              youtube: "https://youtube.com/@minhanh-profile",
            },
          }
        : block,
    ),
  };
  const demoProfile = {
    ownerId: owner.id,
    profileLabel: "Hồ sơ mẫu đầy đủ",
    name: "Nguyễn Minh Anh",
    title: "Nhà thiết kế sản phẩm",
    company: "Studio độc lập",
    location: "Việt Nam",
    bio: "Tôi thiết kế sản phẩm số, xây dựng trải nghiệm rõ ràng và biến ý tưởng thành những giải pháp có thể sử dụng trong thực tế.",
    phone: "+84 912 345 678",
    contactEmail: "hello@example.com",
    website: "https://example.com/minh-anh",
    zalo: "84912345678",
    linkedIn: "https://linkedin.com/in/minhanh-profile",
    telegram: "@minhanh_profile",
    avatarUrl: "/images/demo-profile-nguyen-minh-anh.png",
    coverUrl: "/images/demo-profile-qr-cover.png",
    draftDocument: demoProfileDocument,
    publishedAt: new Date(),
    publishedDocument: demoProfileDocument,
    status: "published" as const,
    template: "cover" as const,
    updatedAt: new Date(),
    visibleFields: defaultProfileVisibility,
  };
  const [profile] = await db
    .insert(profiles)
    .values({ id: demoProfileId, ...demoProfile })
    .onConflictDoUpdate({
      target: profiles.id,
      set: demoProfile,
    })
    .returning();

  const seedQr = [
    {
      publicToken: "DEMO-NEW",
      status: "available" as const,
      ownerId: null,
      activeProfileId: null,
      activatedAt: null,
    },
    {
      publicToken: "DEMO-ACTIVE",
      status: "active" as const,
      ownerId: owner.id,
      activeProfileId: profile.id,
      activatedAt: new Date(),
    },
    {
      publicToken: "DEMO-LOCKED",
      status: "locked" as const,
      ownerId: owner.id,
      activeProfileId: profile.id,
      activatedAt: new Date(),
    },
  ];

  for (const qr of seedQr) {
    await db
      .insert(qrCodes)
      .values(qr)
      .onConflictDoUpdate({
        target: qrCodes.publicToken,
        set: {
          ...qr,
          updatedAt: new Date(),
          version: sql`${qrCodes.version} + 1`,
        },
      });
  }

  const [activeQr] = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.publicToken, "DEMO-ACTIVE"))
    .limit(1);
  const [{ count: scanCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scanEvents)
    .where(eq(scanEvents.qrCodeId, activeQr.id));
  if (scanCount === 0) {
    await db.insert(scanEvents).values(
      Array.from({ length: 5 }, (_, index) => ({
        qrCodeId: activeQr.id,
        deviceType: index < 4 ? "mobile" : "desktop",
      })),
    );
  }

  console.info("Demo data ready: DEMO-NEW, DEMO-ACTIVE, DEMO-LOCKED.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    globalThis.process.exitCode = 1;
  })
  .finally(closeDatabase);
