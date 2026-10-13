import { z } from "zod";

import {
  articleImageAligns,
  profileBackgroundEffectIds,
  profileBackgroundPresetIds,
  profileBlockTypes,
  profileExtraLocales,
  profileStyleIds,
  requiredProfileBlockTypes,
  type ProfileBlockType,
  type ProfileDocument,
} from "@/features/profile/profile-document-types";

const nullableText = (max: number) => z.string().trim().max(max).nullable();
const itemId = z.string().regex(/^[a-z0-9-]{4,40}$/i, "Mã mục không hợp lệ.");
const httpsUrl = z
  .string()
  .trim()
  .max(600)
  .refine((value) => /^https:\/\/[^\s]+$/i.test(value), "Cần đường dẫn https.");
const linkUrl = z
  .string()
  .trim()
  .max(600)
  .refine(
    (value) => /^(https?:\/\/|mailto:|tel:)[^\s]+$/i.test(value),
    "Đường dẫn không hợp lệ.",
  );

export const articleLimits = {
  bodyLength: 6000,
  facts: 30,
  imagesPerSection: 6,
  references: 60,
  sections: 24,
  translationLength: 6000,
  translationKeys: 600,
} as const;

const articleBlockSchema = z.object({
  data: z.object({
    facts: z
      .array(
        z.object({
          id: itemId,
          label: z.string().trim().max(60),
          value: z.string().trim().max(400),
        }),
      )
      .max(articleLimits.facts),
    references: z
      .array(
        z.object({
          date: nullableText(40),
          id: itemId,
          source: nullableText(120),
          title: z.string().trim().max(300),
          url: linkUrl.nullable(),
        }),
      )
      .max(articleLimits.references),
    sections: z
      .array(
        z.object({
          body: z.string().max(articleLimits.bodyLength),
          heading: z.string().trim().max(120),
          id: itemId,
          images: z
            .array(
              z.object({
                align: z.enum(articleImageAligns),
                caption: nullableText(300),
                id: itemId,
                url: httpsUrl,
              }),
            )
            .max(articleLimits.imagesPerSection),
        }),
      )
      .max(articleLimits.sections),
  }),
  id: z.literal("article"),
  type: z.literal("article"),
  visible: z.boolean(),
});
const identityBlockSchema = z.object({
  data: z.object({
    avatarUrl: nullableText(500),
    company: nullableText(120),
    coverUrl: nullableText(500),
    location: nullableText(120),
    name: z.string().trim().max(100),
    title: nullableText(120),
    visibleFields: z.object({
      company: z.boolean(),
      location: z.boolean(),
      title: z.boolean(),
    }),
  }),
  id: z.literal("identity"),
  locked: z.literal(true),
  type: z.literal("identity"),
  visible: z.literal(true),
});

const profileBlockSchema = z.discriminatedUnion("type", [
  identityBlockSchema,
  z.object({
    data: z.object({ text: nullableText(700) }),
    id: z.literal("bio"),
    type: z.literal("bio"),
    visible: z.boolean(),
  }),
  z.object({
    data: z.object({
      contactEmail: z.string().trim().max(254).nullable(),
      phone: nullableText(40),
      visibleFields: z.object({
        email: z.boolean(),
        phone: z.boolean(),
        website: z.boolean(),
      }),
      website: nullableText(240),
    }),
    id: z.literal("contact"),
    type: z.literal("contact"),
    visible: z.boolean(),
  }),
  z.object({
    data: z.object({
      facebook: nullableText(240).default(null),
      github: nullableText(240).default(null),
      instagram: nullableText(240).default(null),
      linkedIn: nullableText(240),
      telegram: nullableText(80),
      tiktok: nullableText(240).default(null),
      visibleFields: z.object({
        facebook: z.boolean().default(true),
        github: z.boolean().default(true),
        instagram: z.boolean().default(true),
        linkedIn: z.boolean(),
        telegram: z.boolean(),
        tiktok: z.boolean().default(true),
        x: z.boolean().default(true),
        youtube: z.boolean().default(true),
        zalo: z.boolean(),
      }),
      x: nullableText(240).default(null),
      youtube: nullableText(240).default(null),
      zalo: nullableText(80),
    }),
    id: z.literal("social"),
    type: z.literal("social"),
    visible: z.boolean(),
  }),
  articleBlockSchema,
]);

const translationsSchema = z
  .partialRecord(
    z.enum(profileExtraLocales),
    z
      .record(
        z
          .string()
          .regex(/^[a-z]+(\.[a-z0-9-]+){1,3}$/i)
          .max(80),
        z.string().max(articleLimits.translationLength),
      )
      .refine(
        (value) => Object.keys(value).length <= articleLimits.translationKeys,
        "Quá nhiều bản dịch.",
      ),
  )
  .optional();

const profileDocumentSchemaBase = z.object({
  blocks: z
    .array(profileBlockSchema)
    .min(requiredProfileBlockTypes.length)
    .max(profileBlockTypes.length),
  languages: z
    .array(z.enum(profileExtraLocales))
    .max(profileExtraLocales.length)
    .optional(),
  schemaVersion: z.literal(1),
  theme: z.object({
    background: z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("style") }),
        z.object({
          presetId: z.enum(profileBackgroundPresetIds),
          type: z.literal("preset"),
        }),
        z.object({
          effectId: z.enum(profileBackgroundEffectIds),
          type: z.literal("effect"),
        }),
        z.object({
          imageUrl: z.string().trim().max(500),
          overlay: z.number().min(0.2).max(0.8),
          type: z.literal("image"),
        }),
      ])
      .default({ type: "style" }),
    headerLayout: z.enum(["cover", "minimal"]),
    themeId: z.enum(profileStyleIds),
  }),
  translations: translationsSchema,
});

export const profileDocumentSchema = profileDocumentSchemaBase.superRefine(
  (document, context) => {
    const types = document.blocks.map((block) => block.type);
    for (const type of requiredProfileBlockTypes) {
      if (types.filter((candidate) => candidate === type).length !== 1) {
        context.addIssue({
          code: "custom",
          message: `Hồ sơ phải có đúng một block ${type}.`,
          path: ["blocks"],
        });
      }
    }
    if (types.filter((candidate) => candidate === "article").length > 1) {
      context.addIssue({
        code: "custom",
        message: "Hồ sơ chỉ có tối đa một block bài viết.",
        path: ["blocks"],
      });
    }
    if (types[0] !== "identity") {
      context.addIssue({
        code: "custom",
        message: "Block danh tính phải đứng đầu hồ sơ.",
        path: ["blocks", 0],
      });
    }
  },
);

export function parseProfileDocument(value: unknown): ProfileDocument | null {
  const parsed = profileDocumentSchema.safeParse(value);
  return parsed.success ? (parsed.data as ProfileDocument) : null;
}

export function isProfileBlockType(value: string): value is ProfileBlockType {
  return (profileBlockTypes as readonly string[]).includes(value);
}
