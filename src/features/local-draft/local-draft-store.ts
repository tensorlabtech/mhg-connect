import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { profileDocumentSchema } from "@/features/profile/profile-document-schema";

const slugPattern = /^[a-z0-9][a-z0-9-]{1,70}$/;
const draftSchema = z.object({
  name: z.string(),
  status: z.literal("local-draft"),
  document: profileDocumentSchema,
  card: z.object({
    logoUrl: z.string(),
    logoName: z.string(),
    logoPresentation: z.enum(["wordmark", "emblem-header"]),
    backgroundUrl: z.string().nullable(),
    tagline: z.string(),
  }),
});
export type LocalProfileDraft = z.infer<typeof draftSchema>;

export function localDraftDirectory(slug: string) {
  if (!slugPattern.test(slug)) throw new Error("Invalid local draft slug");
  return path.join(process.cwd(), ".local-drafts", slug);
}

export async function readLocalProfileDraft(
  slug: string,
): Promise<LocalProfileDraft | null> {
  if (process.env.NODE_ENV !== "development" || !slugPattern.test(slug))
    return null;
  try {
    const file = await readFile(
      path.join(localDraftDirectory(slug), "profile.json"),
      "utf8",
    );
    return draftSchema.parse(JSON.parse(file));
  } catch {
    return null;
  }
}
