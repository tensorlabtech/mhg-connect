"use client";

import { useId } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { articleLimits } from "@/features/profile/profile-document-schema";

export function TranslationField({
  multiline = false,
  onChange,
  original,
  title,
  value,
}: {
  multiline?: boolean;
  onChange: (value: string) => void;
  original: string;
  title: string;
  value: string;
}) {
  const id = useId();
  const placeholder = original.trim() || "(chưa có nội dung tiếng Việt)";
  return (
    <Field>
      <FieldLabel htmlFor={id}>{title}</FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          maxLength={articleLimits.translationLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={original.length > 160 ? 8 : 3}
          value={value}
        />
      ) : (
        <Input
          id={id}
          maxLength={300}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      )}
      {original.trim() ? (
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          Gốc: {original}
        </p>
      ) : null}
    </Field>
  );
}
