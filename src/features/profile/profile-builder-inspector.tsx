"use client";

import { useId, type ComponentProps } from "react";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  BioInspector,
  BlockVisibilityButton,
  DocumentInspector,
  IdentityInspector,
  InspectorHeading,
} from "@/features/profile/profile-builder-inspector-fields";
import type { BuilderSelection } from "@/features/profile/profile-builder-outline";
import { getProfileBlock } from "@/features/profile/profile-document";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import { socialPlatforms } from "@/features/profile/profile-social-platforms";

type ChangeHandler = (document: ProfileDocument, coalesceKey?: string) => void;

export function ProfileBuilderInspector({
  document,
  invalidField,
  onBackToList,
  onChange,
  onProfileLabelChange,
  profileLabel,
  selection,
}: {
  document: ProfileDocument;
  invalidField?: string | null;
  onBackToList?: () => void;
  onChange: ChangeHandler;
  onProfileLabelChange?: (value: string) => void;
  profileLabel?: string;
  selection: BuilderSelection;
}) {
  if (selection === "document") {
    return (
      <DocumentInspector
        document={document}
        onChange={onChange}
        onProfileLabelChange={onProfileLabelChange ?? (() => undefined)}
        profileLabel={profileLabel ?? ""}
      />
    );
  }
  if (selection === "identity") {
    return (
      <IdentityInspector
        document={document}
        invalidField={invalidField}
        onBackToList={onBackToList}
        onChange={onChange}
      />
    );
  }
  if (selection === "bio") {
    return (
      <BioInspector
        document={document}
        onBackToList={onBackToList}
        onChange={onChange}
      />
    );
  }
  return (
    <DirectoryInspector
      document={document}
      invalidField={invalidField}
      onBackToList={onBackToList}
      onChange={onChange}
      type={selection}
    />
  );
}

function DirectoryInspector({
  document,
  invalidField,
  onBackToList,
  onChange,
  type,
}: {
  document: ProfileDocument;
  invalidField?: string | null;
  onBackToList?: () => void;
  onChange: ChangeHandler;
  type: "contact" | "social";
}) {
  const block = getProfileBlock(document, type);
  const title = type === "contact" ? "Thông tin liên hệ" : "Mạng xã hội";

  function setVisible(visible: boolean) {
    update({ ...block, visible });
  }

  return (
    <div className="grid gap-7">
      <InspectorHeading
        onBack={onBackToList}
        title={title}
        visibility={
          <BlockVisibilityButton
            label={title}
            onChange={setVisible}
            visible={block.visible}
          />
        }
      />
      {type === "contact" && block.type === "contact" ? (
        <FieldGroup>
          <>
            <DirectoryField
              aria-invalid={invalidField === "contactEmail" || undefined}
              error={
                invalidField === "contactEmail"
                  ? "Vui lòng nhập email hợp lệ."
                  : undefined
              }
              label="Email"
              maxLength={254}
              name="contactEmail"
              onChange={(value) =>
                update(
                  {
                    ...block,
                    data: { ...block.data, contactEmail: value || null },
                  },
                  "contact.contactEmail",
                )
              }
              placeholder="ten@congty.vn…"
              type="email"
              value={block.data.contactEmail ?? ""}
            />
            <DirectoryField
              label="Điện thoại"
              maxLength={40}
              name="phone"
              onChange={(value) =>
                update(
                  {
                    ...block,
                    data: { ...block.data, phone: value || null },
                  },
                  "contact.phone",
                )
              }
              placeholder="+84 912 345 678…"
              type="tel"
              value={block.data.phone ?? ""}
            />
            <DirectoryField
              label="Website"
              maxLength={240}
              name="website"
              onChange={(value) =>
                update(
                  {
                    ...block,
                    data: { ...block.data, website: value || null },
                  },
                  "contact.website",
                )
              }
              placeholder="https://congty.vn…"
              type="url"
              value={block.data.website ?? ""}
            />
          </>
        </FieldGroup>
      ) : block.type === "social" ? (
        <FieldGroup>
          {socialPlatforms.map((platform) => (
            <DirectoryField
              key={platform.field}
              label={platform.label}
              maxLength={platform.maxLength}
              name={platform.field}
              onChange={(value) =>
                update(
                  {
                    ...block,
                    data: {
                      ...block.data,
                      [platform.field]: value || null,
                    },
                  },
                  `social.${platform.field}`,
                )
              }
              placeholder={platform.placeholder}
              value={block.data[platform.field] ?? ""}
            />
          ))}
        </FieldGroup>
      ) : null}
    </div>
  );

  function update(current: typeof block, coalesceKey?: string) {
    onChange(
      {
        ...document,
        blocks: document.blocks.map((item) =>
          item.type === type ? current : item,
        ),
      } as ProfileDocument,
      coalesceKey,
    );
  }
}

function DirectoryField({
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
