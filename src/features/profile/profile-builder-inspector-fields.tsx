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
import { Switch } from "@/components/ui/switch";
import {
  getTranslation,
  setTranslation,
} from "@/features/profile/profile-article";
import { TranslationField } from "@/features/profile/profile-builder-translation-field";
import { ProfileMediaPicker } from "@/features/profile/profile-media-picker";
import { getProfileBlock } from "@/features/profile/profile-document";
import { ProfileStyleSettings } from "@/features/profile/profile-style-settings";
import {
  profileExtraLocales,
  type ProfileBlock,
  type ProfileBlockType,
  type ProfileDocument,
  type ProfileLocale,
} from "@/features/profile/profile-document-types";
import { profileLocaleLabels } from "@/features/profile/profile-i18n";

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
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">
          Ngôn ngữ cho khách xem
        </legend>
        <p className="text-xs leading-5 text-muted-foreground">
          Tiếng Việt luôn hiển thị. Bật thêm ngôn ngữ để khách bấm chuyển; phần
          chưa dịch sẽ hiện tiếng Việt. Nhập bản dịch bằng nút ngôn ngữ ở đầu
          thanh chỉnh sửa.
        </p>
        {profileExtraLocales.map((locale) => {
          const enabled = document.languages?.includes(locale) ?? false;
          const id = `profile-language-${locale}`;
          return (
            <div
              className="flex min-h-10 items-center justify-between gap-3"
              key={locale}
            >
              <label className="text-sm" htmlFor={id}>
                {profileLocaleLabels[locale].long}
              </label>
              <Switch
                checked={enabled}
                id={id}
                onCheckedChange={(checked) => {
                  const current = new Set(document.languages ?? []);
                  if (checked) current.add(locale);
                  else current.delete(locale);
                  const languages = profileExtraLocales.filter((item) =>
                    current.has(item),
                  );
                  onChange({
                    ...document,
                    languages: languages.length ? languages : undefined,
                  });
                }}
              />
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}

function IdentityTranslationInspector({
  document,
  locale,
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  locale: Exclude<ProfileLocale, "vi">;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "identity");
  const fields = [
    { key: "identity.name", original: block.data.name, title: "Họ và tên" },
    {
      key: "identity.title",
      original: block.data.title ?? "",
      title: "Chức danh",
    },
    {
      key: "identity.company",
      original: block.data.company ?? "",
      title: "Cơ quan",
    },
    {
      key: "identity.location",
      original: block.data.location ?? "",
      title: "Địa điểm",
    },
  ];
  return (
    <div className="grid gap-7">
      <InspectorHeading
        onBack={onBackToList}
        title={`Avatar & Cover · ${profileLocaleLabels[locale].short}`}
      />
      <p className="rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
        Đang nhập bản {profileLocaleLabels[locale].long}. Ảnh dùng chung cho mọi
        ngôn ngữ. Ô để trống sẽ hiện chữ tiếng Việt.
      </p>
      <FieldGroup>
        {fields.map((field) => (
          <TranslationField
            key={field.key}
            onChange={(value) =>
              onChange(
                setTranslation(document, locale, field.key, value),
                field.key,
              )
            }
            original={field.original}
            title={field.title}
            value={getTranslation(document, locale, field.key) ?? ""}
          />
        ))}
      </FieldGroup>
    </div>
  );
}

export function IdentityInspector({
  document,
  invalidField,
  locale = "vi",
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  invalidField?: string | null;
  locale?: ProfileLocale;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  if (locale !== "vi")
    return (
      <IdentityTranslationInspector
        document={document}
        locale={locale}
        onBackToList={onBackToList}
        onChange={onChange}
      />
    );
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
          label="Cơ quan"
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
  locale = "vi",
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  locale?: ProfileLocale;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "bio");
  if (locale !== "vi")
    return (
      <div className="grid gap-7">
        <InspectorHeading
          onBack={onBackToList}
          title={`Giới thiệu · ${profileLocaleLabels[locale].short}`}
        />
        <TranslationField
          multiline
          onChange={(value) =>
            onChange(
              setTranslation(document, locale, "bio.text", value),
              "bio.text",
            )
          }
          original={block.data.text ?? ""}
          title="Nội dung"
          value={getTranslation(document, locale, "bio.text") ?? ""}
        />
      </div>
    );
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
