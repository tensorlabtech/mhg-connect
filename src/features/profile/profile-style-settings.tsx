"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "cn";

import { ProfileBackgroundLibraryDialog } from "@/features/profile/profile-background-library-dialog";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import {
  applyProfileStyle,
  profileStylePacks,
} from "@/features/profile/profile-style-packs";

export function ProfileStyleSettings({
  document,
  onChange,
}: {
  document: ProfileDocument;
  onChange: (document: ProfileDocument) => void;
}) {
  return (
    <div className="grid gap-8">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Phong cách</legend>
        <div
          aria-label="Phong cách hồ sơ"
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
        >
          {profileStylePacks.map((style) => {
            const active = document.theme.themeId === style.id;
            return (
              <button
                aria-checked={active}
                className="group grid min-w-0 gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px"
                key={style.id}
                onClick={() => onChange(applyProfileStyle(document, style.id))}
                role="radio"
                type="button"
              >
                <StyleThumbnail
                  active={active}
                  thumbnailUrl={style.thumbnailUrl}
                />
                <span className="grid min-w-0 gap-0.5 px-0.5">
                  <strong className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{style.label}</span>
                    {active ? (
                      <Check
                        aria-hidden="true"
                        className="size-3.5 text-gold"
                      />
                    ) : null}
                  </strong>
                  <span className="line-clamp-2 text-[0.6875rem] leading-4 text-muted-foreground">
                    {style.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <ProfileBackgroundLibraryDialog document={document} onChange={onChange} />
    </div>
  );
}

function StyleThumbnail({
  active,
  thumbnailUrl,
}: {
  active: boolean;
  thumbnailUrl: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "profile-style-thumbnail relative block aspect-[4/3] overflow-hidden rounded-lg border bg-background transition-[border-color,transform] group-hover:-translate-y-0.5",
        active ? "border-gold" : "border-transparent",
      )}
    >
      <Image
        alt=""
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        fill
        sizes="(max-width: 640px) 45vw, 12rem"
        src={thumbnailUrl}
      />
    </span>
  );
}
