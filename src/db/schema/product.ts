import { sql } from "drizzle-orm";
import {
  boolean,
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
import type { QrCardAppearance } from "@/features/qr/qr-card-appearance";
import {
  QR_CARD_DEFAULT_FONT,
  QR_CARD_DEFAULT_TAGLINE,
  type QrCardFont,
  type QrCardOrientation,
  qrCardOrientations,
  type QrCardPosition,
} from "@/features/qr/qr-card-layout";

export { QR_CARD_DEFAULT_TAGLINE, qrCardOrientations };
export type { QrCardOrientation };

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
      cardAppearance: jsonb("card_appearance").$type<QrCardAppearance>().default({}).notNull(),
    cardPosition: text("card_position")
      .$type<QrCardPosition>()
      .default("bottom")
      .notNull(),
    cardTextStyle: text("card_text_style")
      .$type<QrCardTextStyle>()
      .default("shadow")
      .notNull(),
    cardOrientation: text("card_orientation")
      .$type<QrCardOrientation>()
      .default("portrait")
      .notNull(),
    cardTagline: text("card_tagline")
      .default(QR_CARD_DEFAULT_TAGLINE)
      .notNull(),
    cardFont: text("card_font")
      .$type<QrCardFont>()
      .default(QR_CARD_DEFAULT_FONT)
      .notNull(),
    cardTextColor: text("card_text_color"),
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
      "qr_codes_card_position_check",
      sql`${table.cardPosition} in ('left', 'right', 'top', 'bottom')`,
    ),
    check(
      "qr_codes_card_text_style_check",
      sql`${table.cardTextStyle} in ('shadow', 'band', 'dark', 'light')`,
    ),
    check(
      "qr_codes_card_orientation_check",
      sql`${table.cardOrientation} in ('portrait', 'landscape')`,
    ),
    check(
      "qr_codes_card_font_check",
      sql`${table.cardFont} in ('be-vietnam', 'manrope', 'oswald', 'playfair', 'lora', 'dancing')`,
    ),
    check(
      "qr_codes_card_text_color_check",
      sql`${table.cardTextColor} is null or ${table.cardTextColor} ~ '^#[0-9a-f]{6}$'`,
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
    position: text("position")
      .$type<QrCardPosition>()
      .default("bottom")
      .notNull(),
    textStyle: text("text_style")
      .$type<QrCardTextStyle>()
      .default("shadow")
      .notNull(),
    orientation: text("orientation")
      .$type<QrCardOrientation>()
      .default("portrait")
      .notNull(),
    tagline: text("tagline").default(QR_CARD_DEFAULT_TAGLINE).notNull(),
    font: text("font")
      .$type<QrCardFont>()
      .default(QR_CARD_DEFAULT_FONT)
      .notNull(),
    textColor: text("text_color"),
      appearance: jsonb("appearance").$type<QrCardAppearance>().default({}).notNull(),
    heading: text("heading"),
    description: text("description"),
    location: text("location"),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
    updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("qr_card_designs_qr_code_id_idx").on(table.qrCodeId),
    check(
      "qr_card_designs_position_check",
      sql`${table.position} in ('left', 'right', 'top', 'bottom')`,
    ),
    check(
      "qr_card_designs_text_style_check",
      sql`${table.textStyle} in ('shadow', 'band', 'dark', 'light')`,
    ),
    check(
      "qr_card_designs_orientation_check",
      sql`${table.orientation} in ('portrait', 'landscape')`,
    ),
    check(
      "qr_card_designs_font_check",
      sql`${table.font} in ('be-vietnam', 'manrope', 'oswald', 'playfair', 'lora', 'dancing')`,
    ),
    check(
      "qr_card_designs_text_color_check",
      sql`${table.textColor} is null or ${table.textColor} ~ '^#[0-9a-f]{6}$'`,
    ),
  ],
);

/**
 * Mẫu sticker/thẻ có sẵn (sticker sản phẩm MHG, chủ đề Đất nước…). Lưu trong database
 * để thêm, sửa, ẩn mẫu mà không cần sửa code; ảnh nền nằm trong public/brand/card-backgrounds.
 */
export const qrCardPresets = pgTable(
  "qr_card_presets",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    backgroundUrl: text("background_url").notNull(),
    orientation: text("orientation")
      .$type<QrCardOrientation>()
      .default("portrait")
      .notNull(),
    textStyle: text("text_style")
      .$type<QrCardTextStyle>()
      .default("dark")
      .notNull(),
    tagline: text("tagline").default(QR_CARD_DEFAULT_TAGLINE).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: productTimestamp("created_at").defaultNow().notNull(),
    updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("qr_card_presets_active_sort_idx").on(table.active, table.sortOrder),
    check(
      "qr_card_presets_text_style_check",
      sql`${table.textStyle} in ('shadow', 'band', 'dark', 'light')`,
    ),
    check(
      "qr_card_presets_orientation_check",
      sql`${table.orientation} in ('portrait', 'landscape')`,
    ),
    check(
      "qr_card_presets_background_check",
      sql`${table.backgroundUrl} like '/brand/card-backgrounds/%'`,
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

export const enterprises = pgTable("enterprises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  customLogoEnabled: boolean("custom_logo_enabled").default(false).notNull(),
  /**
   * Giữ cột vì migration 0017 đã chạy trên database thật. Bản trên main không đọc cột này:
   * mọi thẻ luôn có logo MHG. Bỏ logo MHG chỉ là tuỳ biến trên máy (nhánh minh/local-chi-logo-mttq).
   */
  hideMhgLogo: boolean("hide_mhg_logo").default(false).notNull(),
  logoUrl: text("logo_url"),
  updatedAt: productTimestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseMembers = pgTable(
  "enterprise_members",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("enterprise_members_enterprise_idx").on(table.enterpriseId),
  ],
);
