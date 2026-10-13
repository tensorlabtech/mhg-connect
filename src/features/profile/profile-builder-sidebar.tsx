"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  LoaderCircle,
  Redo2,
  Undo2,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, IconButton } from "@/components/ui/button";
import { ProfileBuilderInspector } from "@/features/profile/profile-builder-inspector";
import {
  ProfileBuilderOutline,
  type BuilderSelection,
} from "@/features/profile/profile-builder-outline";
import {
  profileLocales,
  type ProfileDocument,
  type ProfileLocale,
} from "@/features/profile/profile-document-types";
import { profileLocaleLabels } from "@/features/profile/profile-i18n";

export type ProfileBuilderSidebarMode = "detail" | "list";
type SaveStatus = "conflict" | "dirty" | "error" | "saved" | "saving";

type SidebarProps = {
  canRedo: boolean;
  canUndo: boolean;
  document: ProfileDocument;
  hasUnsavedChanges: boolean;
  invalidField: string | null;
  locale: ProfileLocale;
  mode: ProfileBuilderSidebarMode;
  onBack: () => void;
  onBackToList: () => void;
  onChange: (document: ProfileDocument, coalesceKey?: string) => void;
  onClose?: () => void;
  onLocaleChange: (locale: ProfileLocale) => void;
  onProfileLabelChange: (value: string) => void;
  onRedo: () => void;
  onRetry: () => void;
  onSave: () => void;
  onSelect: (selection: BuilderSelection) => void;
  onUndo: () => void;
  profileLabel: string;
  saveError: string | null;
  saving: boolean;
  saveStatus: SaveStatus;
  selection: BuilderSelection;
};

export function ProfileBuilderSidebar(props: SidebarProps) {
  const {
    canRedo,
    canUndo,
    document,
    hasUnsavedChanges,
    invalidField,
    locale,
    mode,
    onBack,
    onBackToList,
    onChange,
    onClose,
    onLocaleChange,
    onProfileLabelChange,
    onRedo,
    onRetry,
    onSave,
    onSelect,
    onUndo,
    profileLabel,
    saveError,
    saving,
    saveStatus,
    selection,
  } = props;
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <header className="flex min-h-16 shrink-0 items-center gap-1 px-3 py-2">
        <IconButton
          disabled={saving}
          onClick={onClose ?? onBack}
          size="icon-lg"
          tooltip={onClose ? "Đóng trình chỉnh sửa" : "Về dashboard"}
          type="button"
          variant="secondary"
        >
          <ArrowLeft aria-hidden="true" />
        </IconButton>
        <div className="ml-auto flex items-center gap-1">
          <IconButton
            disabled={saving || !canUndo}
            onClick={onUndo}
            size="icon-lg"
            tooltip="Hoàn tác"
            type="button"
            variant="ghost"
          >
            <Undo2 aria-hidden="true" />
          </IconButton>
          <IconButton
            disabled={saving || !canRedo}
            onClick={onRedo}
            size="icon-lg"
            tooltip="Làm lại"
            type="button"
            variant="ghost"
          >
            <Redo2 aria-hidden="true" />
          </IconButton>
          <SaveButton
            hasUnsavedChanges={hasUnsavedChanges}
            onRetry={onRetry}
            onSave={onSave}
            saving={saving}
            status={saveStatus}
          />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {saveError ? <SaveError error={saveError} /> : null}
        <LocalePicker
          document={document}
          disabled={saving}
          locale={locale}
          onChange={onLocaleChange}
        />
        {mode === "list" ? (
          <div className="grid gap-10">
            <section
              className="grid gap-4"
              aria-labelledby="profile-blocks-title"
            >
              <h1 className="text-base font-medium" id="profile-blocks-title">
                Các Block
              </h1>
              <ProfileBuilderOutline
                disabled={saving}
                document={document}
                onChange={onChange}
                onSelect={onSelect}
              />
            </section>
            <section
              className="grid gap-5"
              aria-labelledby="profile-settings-title"
            >
              <h2 className="text-base font-medium" id="profile-settings-title">
                Cài đặt hồ sơ
              </h2>
              <fieldset className="min-w-0" disabled={saving}>
                <ProfileBuilderInspector
                  document={document}
                  invalidField={invalidField}
                  onChange={onChange}
                  onProfileLabelChange={onProfileLabelChange}
                  profileLabel={profileLabel}
                  selection="document"
                />
              </fieldset>
            </section>
          </div>
        ) : (
          <fieldset className="min-w-0" disabled={saving}>
            <ProfileBuilderInspector
              document={document}
              invalidField={invalidField}
              locale={locale}
              onBackToList={onBackToList}
              onChange={onChange}
              selection={selection}
            />
          </fieldset>
        )}
      </div>
    </div>
  );
}

function LocalePicker({
  disabled,
  document,
  locale,
  onChange,
}: {
  disabled: boolean;
  document: ProfileDocument;
  locale: ProfileLocale;
  onChange: (locale: ProfileLocale) => void;
}) {
  const visitorReady =
    locale === "vi" || (document.languages?.includes(locale) ?? false);
  return (
    <div className="mb-6 grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground" id="builder-locale">
          Ngôn ngữ đang nhập
        </span>
        <div
          aria-labelledby="builder-locale"
          className="inline-flex rounded-control bg-muted p-0.5"
          role="radiogroup"
        >
          {profileLocales.map((item) => (
            <button
              aria-checked={item === locale}
              className={`h-control-xs rounded-[calc(var(--radius-control)-2px)] px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 ${
                item === locale
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              disabled={disabled}
              key={item}
              onClick={() => onChange(item)}
              role="radio"
              title={profileLocaleLabels[item].long}
              type="button"
            >
              {profileLocaleLabels[item].short}
            </button>
          ))}
        </div>
      </div>
      {!visitorReady ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Bản {profileLocaleLabels[locale].long} chưa bật cho khách xem. Bật ở
          mục &quot;Ngôn ngữ cho khách xem&quot; trong Cài đặt hồ sơ.
        </p>
      ) : null}
    </div>
  );
}

function SaveError({ error }: { error: string }) {
  return (
    <Alert className="mb-5" variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

function SaveButton({
  hasUnsavedChanges,
  onRetry,
  onSave,
  saving,
  status,
}: {
  hasUnsavedChanges: boolean;
  onRetry: () => void;
  onSave: () => void;
  saving: boolean;
  status: SaveStatus;
}) {
  const failed = status === "conflict" || status === "error";
  const label = saving
    ? "Đang lưu"
    : failed
      ? "Thử lưu lại"
      : hasUnsavedChanges
        ? "Lưu"
        : "Đã lưu";
  return (
    <Button
      aria-live="polite"
      className="w-32 px-3"
      disabled={saving || (!hasUnsavedChanges && !failed)}
      onClick={failed ? onRetry : onSave}
      size="lg"
      type="button"
      variant={failed ? "destructive" : "default"}
    >
      {saving ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : failed ? (
        <AlertCircle aria-hidden="true" />
      ) : !hasUnsavedChanges ? (
        <Check aria-hidden="true" />
      ) : null}
      {label}
    </Button>
  );
}
