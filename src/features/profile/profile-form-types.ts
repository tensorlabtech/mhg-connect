import type {
  ProfileStatus,
  ProfileTemplate,
  ProfileVisibility,
} from "@/db/schema";

export type ProfileFormValues = {
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  company: string | null;
  contactEmail: string | null;
  id?: string;
  linkedIn: string | null;
  location: string | null;
  name: string;
  phone: string | null;
  status: ProfileStatus;
  telegram: string | null;
  template: ProfileTemplate;
  title: string | null;
  visibleFields: ProfileVisibility;
  website: string | null;
  zalo: string | null;
};

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
