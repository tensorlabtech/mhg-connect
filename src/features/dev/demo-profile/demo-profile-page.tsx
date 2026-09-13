import { defaultProfileVisibility } from "@/db/schema";
import { profile } from "@/features/dev/demo-profile/demo-profile-data";
import { createProfileDocument } from "@/features/profile/profile-document";
import type { ProfileStyleId } from "@/features/profile/profile-document-types";
import { PublicProfile } from "@/features/profile/public-profile";
import { getProfileStylePack } from "@/features/profile/profile-style-packs";

const demoProfile = {
  avatarUrl: profile.image,
  bio: profile.bio,
  company: profile.company,
  contactEmail: profile.email,
  coverUrl: profile.coverImage,
  linkedIn: "https://www.linkedin.com/in/minhanh-profile",
  location: profile.location,
  name: profile.name,
  phone: profile.phone,
  publicToken: "DEMO-PROFILE",
  telegram: "@minhanh_profile",
  template: "minimal" as const,
  title: profile.role,
  visibleFields: defaultProfileVisibility,
  website: profile.websiteHref,
  zalo: profile.phone,
};

export default function DemoProfilePage({
  styleId = "studio-light",
}: {
  styleId?: ProfileStyleId;
}) {
  const style = getProfileStylePack(styleId);
  const demoDocument = createProfileDocument({
    ...demoProfile,
    status: "published" as const,
  });

  demoDocument.blocks = demoDocument.blocks.map((block) =>
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
  );

  demoDocument.theme = {
    background: { type: "style" },
    headerLayout: style.headerLayout,
    themeId: style.id,
  };

  return (
    <div className="profile-thumbnail-capture">
      <PublicProfile document={demoDocument} profile={demoProfile} />
    </div>
  );
}
