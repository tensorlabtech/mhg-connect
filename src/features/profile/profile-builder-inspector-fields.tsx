"use client";

import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";

import { IconButton } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileMediaPicker } from "@/features/profile/profile-media-picker";
import { getProfileBlock } from "@/features/profile/profile-document";
import { ProfileStyleSettings } from "@/features/profile/profile-style-settings";
import type {
  ProfileBlock,
  ProfileBlockType,
  ProfileDocument,
} from "@/features/profile/profile-document-types";

type ChangeHandler = (document: ProfileDocument, coalesceKey?: string) => void;

function updateBlock<T extends ProfileBlockType>(
  document: ProfileDocument,
  type: T,
  update: (block: Extract<ProfileBlock, { type: T }>) => ProfileBlock,
) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === type
        ? update(block as Extract<ProfileBlock, { type: T }>)
        : block,
    ),
  } as ProfileDocument;
}

export function DocumentInspector({
  document,
  onChange,
  onProfileLabelChange,
  profileLabel,
}: {
  document: ProfileDocument;
  onChange: ChangeHandler;
  onProfileLabelChange: (value: string) => void;
  profileLabel: string;
}) {
  return (
    <div className="grid gap-8">
      <Field>
        <FieldLabel htmlFor="profile-label">Tên hồ sơ</FieldLabel>
        <Input
          id="profile-label"
          maxLength={120}
          onChange={(event) => onProfileLabelChange(event.target.value)}
          placeholder="Hồ sơ 11/09/2026"
          value={profileLabel}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Chỉ dùng để nhận diện hồ sơ trong dashboard, không hiển thị công khai.
        </p>
      </Field>
      <ProfileStyleSettings document={document} onChange={onChange} />
    </div>
  );
}

export function IdentityInspector({
  document,
  invalidField,
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  invalidField?: string | null;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "identity");
  const setData = (patch: Partial<typeof block.data>, key?: string) =>
    onChange(
      updateBlock(document, "identity", (current) => ({
        ...current,
        data: { ...current.data, ...patch },
      })),
      key,
    );
  return (
    <div className="grid gap-7">
      <InspectorHeading onBack={onBackToList} title="Avatar & Cover" />
      <ProfileMediaPicker
        avatarUrl={block.data.avatarUrl}
        coverUrl={block.data.coverUrl}
        onAvatarChange={(avatarUrl) => setData({ avatarUrl })}
        onCoverChange={(coverUrl) => setData({ coverUrl })}
      />
      <FieldGroup>
        <InspectorTextField
          aria-invalid={invalidField === "name" || undefined}
          error={
            invalidField === "name" ? "Vui lòng nhập họ và tên." : undefined
          }
          label="Họ và tên"
          maxLength={100}
          name="name"
          onChange={(value) => setData({ name: value }, "identity.name")}
          placeholder="Nguyễn Minh Anh…"
          value={block.data.name}
        />
        <InspectorTextField
          label="Chức danh"
          maxLength={120}
          name="title"
          onChange={(value) =>
            setData({ title: value || null }, "identity.title")
          }
          placeholder="Giám đốc phát triển sản phẩm…"
          value={block.data.title ?? ""}
        />
        <InspectorTextField
          label="Công ty"
          maxLength={120}
          name="company"
          onChange={(value) =>
            setData({ company: value || null }, "identity.company")
          }
          placeholder="MHG…"
          value={block.data.company ?? ""}
        />
        <InspectorTextField
          label="Địa điểm"
          maxLength={120}
          name="location"
          onChange={(value) =>
            setData({ location: value || null }, "identity.location")
          }
          placeholder="Hà Nội, Việt Nam…"
          value={block.data.location ?? ""}
        />
      </FieldGroup>
    </div>
  );
}

export function BioInspector({
  document,
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "bio");
  return (
    <div className="grid gap-7">
      <InspectorHeading
        onBack={onBackToList}
        title="Giới thiệu"
        visibility={
          <BlockVisibilityButton
            label="Giới thiệu"
            onChange={(visible) =>
              onChange(
                updateBlock(document, "bio", (current) => ({
                  ...current,
                  visible,
                })),
              )
            }
            visible={block.visible}
          />
        }
      />
      <Field>
        <FieldLabel htmlFor="profile-bio">Nội dung</FieldLabel>
        <Textarea
          id="profile-bio"
          maxLength={700}
          onChange={(event) =>
            onChange(
              updateBlock(document, "bio", (current) => ({
                ...current,
                data: { text: event.target.value || null },
              })),
              "bio.text",
            )
          }
          name="bio"
          placeholder="Chia sẻ ngắn về bạn…"
          rows={5}
          value={block.data.text ?? ""}
        />
      </Field>
    </div>
  );
}

export function BlockVisibilityButton({
  disabled = false,
  label,
  onChange,
  visible,
}: {
  disabled?: boolean;
  label: string;
  onChange: (visible: boolean) => void;
  visible: boolean;
}) {
  return (
    <IconButton
      aria-pressed={visible}
      disabled={disabled}
      onClick={() => onChange(!visible)}
      size="icon-lg"
      tooltip={`${visible ? "Ẩn" : "Hiện"} ${label}`}
      type="button"
      variant="secondary"
    >
      {visible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
    </IconButton>
  );
}

export function InspectorHeading({
  onBack,
  title,
  visibility,
}: {
  onBack?: () => void;
  title: string;
  visibility?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center gap-2">
      {onBack ? (
        <IconButton
          onClick={onBack}
          size="icon-lg"
          tooltip="Quay lại các block"
          type="button"
          variant="secondary"
        >
          <ChevronLeft aria-hidden="true" />
        </IconButton>
      ) : null}
      <h2 className="min-w-0 flex-1 truncate text-lg font-medium">{title}</h2>
      {visibility}
    </div>
  );
}

function InspectorTextField({
  error,
  label,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "onChange"> & {
  label: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...props}
        aria-label={label}
        autoComplete="off"
        id={id}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
