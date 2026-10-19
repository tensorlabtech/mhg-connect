import type { ProfileDocument } from "@/features/profile/profile-document-types";

export type SaveProfileResult =
  | {
      document: ProfileDocument;
      profileId: string;
      publicToken?: string;
      success: true;
      version: number;
    }
  | {
      conflict?: boolean;
      error: string;
      field?: string;
      success: false;
    };
