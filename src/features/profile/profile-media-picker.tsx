"use client";

import { ImageIcon, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { coverPresets } from "@/features/profile/profile-demo-media";
import {
  HiddenMediaInput,
  MediaField,
  type ProfileMediaKind,
  ResetButton,
  UploadArea,
} from "@/features/profile/profile-media-upload-area";

type ProfileMediaPickerProps = {
  avatarUrl: string | null;
  coverUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  onCoverChange: (url: string) => void;
};

export function ProfileMediaPicker({
  avatarUrl,
  coverUrl,
  onAvatarChange,
  onCoverChange,
}: ProfileMediaPickerProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Partial<Record<ProfileMediaKind, string>>>({});
  const [fileNames, setFileNames] = useState<
    Partial<Record<ProfileMediaKind, string>>
  >({});
  const [errors, setErrors] = useState<
    Partial<Record<ProfileMediaKind, string>>
  >({});
  const activeCoverUrl = coverUrl || coverPresets[0].url;

  useEffect(
    () => () =>
      Object.values(objectUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      ),
    [],
  );

  function clearObjectUrl(kind: ProfileMediaKind) {
    const current = objectUrlsRef.current[kind];
    if (current) URL.revokeObjectURL(current);
    delete objectUrlsRef.current[kind];
  }

  function applyFile(file: File, kind: ProfileMediaKind) {
    const input =
      kind === "avatar" ? avatarInputRef.current : coverInputRef.current;
    const limit = kind === "avatar" ? 2 : 5;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
      setErrors((current) => ({
        ...current,
        [kind]: "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.",
      }));
      return;
    }
    if (file.size > limit * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        [kind]: `Ảnh phải nhỏ hơn ${limit} MB.`,
      }));
      return;
    }
    if (input && input.files?.[0] !== file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
    }
    clearObjectUrl(kind);
    const url = URL.createObjectURL(file);
    objectUrlsRef.current[kind] = url;
    setFileNames((current) => ({ ...current, [kind]: file.name }));
    setErrors((current) => ({ ...current, [kind]: undefined }));
    if (kind === "avatar") onAvatarChange(url);
    else onCoverChange(url);
  }

  function handleInput(
    event: ChangeEvent<HTMLInputElement>,
    kind: ProfileMediaKind,
  ) {
    const file = event.target.files?.[0];
    if (file) applyFile(file, kind);
  }

  function handleDrop(
    event: DragEvent<HTMLButtonElement>,
    kind: ProfileMediaKind,
  ) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file, kind);
  }

  function resetMedia(kind: ProfileMediaKind) {
    const input =
      kind === "avatar" ? avatarInputRef.current : coverInputRef.current;
    if (input) input.value = "";
    clearObjectUrl(kind);
    setFileNames((current) => ({ ...current, [kind]: undefined }));
    setErrors((current) => ({ ...current, [kind]: undefined }));
    if (kind === "avatar") onAvatarChange(null);
    else onCoverChange(coverPresets[0].url);
  }

  return (
    <div className="grid gap-6">
      <MediaField
        action={
          avatarUrl ? (
            <ResetButton label="Bỏ ảnh" onClick={() => resetMedia("avatar")}>
              <Trash2 aria-hidden="true" />
            </ResetButton>
          ) : null
        }
        label="Ảnh đại diện"
      >
        <HiddenMediaInput
          inputRef={avatarInputRef}
          kind="avatar"
          onChange={handleInput}
        />
        <UploadArea
          error={errors.avatar}
          fileName={fileNames.avatar}
          kind="avatar"
          onClick={() => avatarInputRef.current?.click()}
          onDrop={(event) => handleDrop(event, "avatar")}
          preview={
            <Avatar className="size-20 bg-background">
              {avatarUrl ? (
                <AvatarImage alt="Ảnh đại diện đang chọn" src={avatarUrl} />
              ) : null}
              <AvatarFallback>
                <ImageIcon className="size-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          }
        />
      </MediaField>

      <MediaField
        action={
          activeCoverUrl !== coverPresets[0].url ? (
            <ResetButton
              label="Dùng ảnh mẫu"
              onClick={() => resetMedia("cover")}
            >
              <RotateCcw aria-hidden="true" />
            </ResetButton>
          ) : null
        }
        label="Ảnh bìa"
      >
        <HiddenMediaInput
          inputRef={coverInputRef}
          kind="cover"
          onChange={handleInput}
        />
        <UploadArea
          error={errors.cover}
          fileName={fileNames.cover}
          kind="cover"
          onClick={() => coverInputRef.current?.click()}
          onDrop={(event) => handleDrop(event, "cover")}
          preview={
            <span className="relative block aspect-[3/1] w-full overflow-hidden rounded-md bg-background">
              <Image
                alt="Ảnh bìa đang chọn"
                className="object-cover"
                fill
                sizes="360px"
                src={activeCoverUrl}
                unoptimized={activeCoverUrl.startsWith("blob:")}
              />
            </span>
          }
        />
      </MediaField>
    </div>
  );
}
