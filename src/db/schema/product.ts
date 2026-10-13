import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/db/schema/auth";

export const profileStatuses = ["draft", "published"] as const;
export const profileTemplates = ["cover", "minimal"] as const;
export const qrStatuses = ["available", "active", "locked"] as const;
export const qrCardTextStyles = ["shadow", "band", "dark", "light"] as const;

export type ProfileStatus = (typeof profileStatuses)[number];
export type ProfileTemplate = (typeof profileTemplates)[number];
export type QrStatus = (typeof qrStatuses)[number];
export type QrCardTextStyle = (typeof qrCardTextStyles)[number];

export type ProfileVisibility = {
  bio: boolean;
  company: boolean;
  email: boolean;
  linkedIn: boolean;
  location: boolean;
  phone: boolean;
  telegram: boolean;
  title: boolean;
  website: boolean;
  zalo: boolean;
};

export const defaultProfileVisibility: ProfileVisibility = {
  bio: true,
  company: true,
  email: true,
  linkedIn: true,
  location: true,
  phone: true,
  telegram: true,
  title: true,
  website: true,
  zalo: true,
};

const productTimestamp = (name: string) =>
  timestamp(name, { mode: "date", withTimezone: true });

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    profileLabel: text("profile_label"),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    location: text("location"),
    bio: text("bio"),
    phone: text("phone"),
    contactEmail: text("contact_email"),
    website: text("website"),
    zalo: text("zalo"),
    linkedIn: text("linkedin"),
    telegram: text("telegram"),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    template: text("template")
      .$type<ProfileTemplate>()
      .default("cover")
      .notNull(),
    visibleFields: jsonb("visible_fields")
      .$type<ProfileVisibility>()
      .default(defaultProfileVisibility)
      .notNull(),
    draftDocument: jsonb("draft_document"),
    publishedDocument: jsonb("published_document"),
    documentVersion: integer("document_version").default(1).notNull(),
    status: text("status").$type<ProfileStatus>().default("draft").notNull(),
    publishedAt: productTimestamp("published_at"),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
    updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("profiles_owner_id_idx").on(table.ownerId),
    unique("profiles_id_owner_unique").on(table.id, table.ownerId),
    check(
      "profiles_status_check",
      sql`${table.status} in ('draft', 'published')`,
    ),
    check(
      "profiles_template_check",
      sql`${table.template} in ('cover', 'minimal')`,
    ),
    check("profiles_document_version_check", sql`${table.documentVersion} > 0`),
  ],
);

export const qrCodes = pgTable(
  "qr_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicToken: text("public_token").notNull().unique(),
    status: text("status").$type<QrStatus>().default("available").notNull(),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "restrict",
    }),
    activeProfileId: uuid("active_profile_id"),
    cardBackgroundUrl: text("card_background_url"),
    cardTextStyle: text("card_text_style")
      .$type<QrCardTextStyle>()
      .default("shadow")
      .notNull(),
    activatedAt: productTimestamp("activated_at"),
    version: integer("version").default(1).notNull(),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
    updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("qr_codes_owner_id_idx").on(table.ownerId),
    index("qr_codes_active_profile_id_idx").on(table.activeProfileId),
    foreignKey({
      columns: [table.activeProfileId, table.ownerId],
      foreignColumns: [profiles.id, profiles.ownerId],
      name: "qr_codes_active_profile_owner_fk",
    }).onDelete("restrict"),
    check(
      "qr_codes_status_check",
      sql`${table.status} in ('available', 'active', 'locked')`,
    ),
    check(
      "qr_codes_lifecycle_check",
      sql`(
        ${table.status} = 'available'
        and ${table.ownerId} is null
        and ${table.activeProfileId} is null
        and ${table.activatedAt} is null
      ) or (
        ${table.status} in ('active', 'locked')
        and ${table.ownerId} is not null
      )`,
    ),
    check("qr_codes_version_check", sql`${table.version} > 0`),
    check(
      "qr_codes_card_text_style_check",
      sql`${table.cardTextStyle} in ('shadow', 'band', 'dark', 'light')`,
    ),
  ],
);

export const qrCardDesigns = pgTable(
  "qr_card_designs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    qrCodeId: uuid("qr_code_id")
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    backgroundUrl: text("background_url"),
    textStyle: text("text_style")
      .$type<QrCardTextStyle>()
      .default("shadow")
      .notNull(),
    heading: text("heading"),
    description: text("description"),
    location: text("location"),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
    updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("qr_card_designs_qr_code_id_idx").on(table.qrCodeId),
    check(
      "qr_card_designs_text_style_check",
      sql`${table.textStyle} in ('shadow', 'band', 'dark', 'light')`,
    ),
  ],
);

export const scanEvents = pgTable(
  "scan_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    qrCodeId: uuid("qr_code_id")
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    deviceType: text("device_type").default("unknown").notNull(),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("scan_events_qr_created_idx").on(table.qrCodeId, table.createdAt),
  ],
);

export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    qrCodeId: uuid("qr_code_id")
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("admin_actions_qr_created_idx").on(table.qrCodeId, table.createdAt),
  ],
);

export const qrClaimRateLimits = pgTable(
  "qr_claim_rate_limits",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bucketStart: productTimestamp("bucket_start").notNull(),
    attempts: integer("attempts").default(1).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.bucketStart] }),
    index("qr_claim_rate_limits_bucket_start_idx").on(table.bucketStart),
    check("qr_claim_rate_limits_attempts_check", sql`${table.attempts} > 0`),
  ],
);
