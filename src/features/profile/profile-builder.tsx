"use client";

import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, IconButton } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { saveProfileAction } from "@/features/profile/profile-builder-actions";
import type { BuilderSelection } from "@/features/profile/profile-builder-outline";
import {
  ProfileBuilderSidebar,
  type ProfileBuilderSidebarMode,
} from "@/features/profile/profile-builder-sidebar";
import {
  documentsEqual,
  normalizeProfileDocumentVisibility,
  profileDocumentToFlat,
} from "@/features/profile/profile-document";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import { PublicProfile } from "@/features/profile/public-profile";
import { useProfileBuilderHistory } from "@/features/profile/use-profile-builder-history";

type ProfileBuilderProps = {
  initialDocument: ProfileDocument;
  initialProfileId?: string;
  initialProfileLabel: string;
  initialVersion: number;
  linkedQr: Array<{ id: string; token: string }>;
  qrToken?: string;
};
type SaveStatus = "conflict" | "dirty" | "error" | "saved" | "saving";
const desktopSidebarQuery = "(min-width: 1024px)";

function subscribeToDesktopSidebar(change: () => void) {
  const media = window.matchMedia(desktopSidebarQuery);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
function getDesktopSidebarSnapshot() {
  return window.matchMedia(desktopSidebarQuery).matches;
}

export function ProfileBuilder(props: ProfileBuilderProps) {
  return <ProfileBuilderEditor {...props} />;
}

function ProfileBuilderEditor({
  initialDocument,
  initialProfileId,
  initialProfileLabel,
  initialVersion,
  linkedQr,
  qrToken = "",
}: ProfileBuilderProps) {
  const router = useRouter();
  const desktopSidebar = useSyncExternalStore(
    subscribeToDesktopSidebar,
    getDesktopSidebarSnapshot,
    () => false,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const savedInitialDocument =
    normalizeProfileDocumentVisibility(initialDocument);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveErrorField, setSaveErrorField] = useState<string | null>(null);
  const [profileId, setProfileId] = useState(initialProfileId);
  const [profileLabel, setProfileLabel] = useState(initialProfileLabel);
  const [savedDocument, setSavedDocument] = useState(savedInitialDocument);
  const [savedLabel, setSavedLabel] = useState(initialProfileLabel);
  const [version, setVersion] = useState(initialVersion);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [selection, setSelection] = useState<BuilderSelection>("identity");
  const [sidebarMode, setSidebarMode] =
    useState<ProfileBuilderSidebarMode>("list");
  const history = useProfileBuilderHistory(savedInitialDocument);
  const editorDocument = history.document;
  const hasUnsavedChanges =
    !documentsEqual(editorDocument, savedDocument) ||
    profileLabel !== savedLabel;
  const saveStatus: SaveStatus = saving
    ? "saving"
    : saveError
      ? saveErrorField === "conflict"
        ? "conflict"
        : "error"
      : hasUnsavedChanges
        ? "dirty"
        : "saved";
  const publicToken = linkedQr[0]?.token || qrToken;
  const previewProfile = {
    ...profileDocumentToFlat(editorDocument),
    publicToken: publicToken || "PREVIEW",
  };

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z")
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable)
      )
        return;
      if (saving) return;
      event.preventDefault();
      if (event.shiftKey) history.redo();
      else history.undo();
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [history, saving]);

  const changeDocument = useCallback(
    (document: ProfileDocument, coalesceKey?: string) => {
      if (saving) return;
      setSaveError(null);
      setSaveErrorField(null);
      history.update(normalizeProfileDocumentVisibility(document), coalesceKey);
    },
    [history, saving],
  );

  function focusInvalidField(field: string | undefined) {
    const target =
      field === "name"
        ? { block: "identity" as const, label: "Họ và tên" }
        : field === "contactEmail"
          ? { block: "contact" as const, label: "Email" }
          : null;
    if (!target) return;
    setSelection(target.block);
    setSidebarMode("detail");
    setMobileSidebarOpen(true);
    requestAnimationFrame(() =>
      globalThis.document
        .querySelector<HTMLInputElement>(`[aria-label="${target.label}"]`)
        ?.focus(),
    );
  }

  async function handleSave() {
    if (saving) return false;
    setSaving(true);
    setSaveError(null);
    setSaveErrorField(null);
    try {
      const formData = new FormData(formRef.current ?? undefined);
      formData.set("document", JSON.stringify(editorDocument));
      formData.set("expectedVersion", String(version));
      formData.set("profileId", profileId ?? "");
      formData.set("profileLabel", profileLabel);
      formData.set("qrToken", qrToken);
      const result = await saveProfileAction(formData);
      if (!result.success) {
        setSaveError(result.error);
        setSaveErrorField(
          result.conflict ? "conflict" : (result.field ?? null),
        );
        focusInvalidField(result.field);
        return false;
      }
      const saved = normalizeProfileDocumentVisibility(result.document);
      if (!documentsEqual(saved, editorDocument)) history.update(saved);
      setSavedDocument(saved);
      setSavedLabel(profileLabel);
      setProfileId(result.profileId);
      setVersion(result.version);
      const backgroundInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="background"]',
      );
      if (backgroundInput) backgroundInput.value = "";
      window.history.replaceState(
        window.history.state,
        "",
        `/profiles/${result.profileId}/edit?saved=1`,
      );
      return true;
    } catch {
      setSaveError("Không thể lưu hồ sơ lúc này. Vui lòng thử lại.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function requestExit() {
    if (saving) return;
    if (hasUnsavedChanges) {
      setExitDialogOpen(true);
      return;
    }
    router.push("/dashboard");
  }
  async function saveAndExit() {
    if (await handleSave()) router.push("/dashboard");
  }
  function handleSelect(next: BuilderSelection) {
    setSelection(next);
    setSidebarMode("detail");
    if (window.matchMedia("(max-width: 1023px)").matches)
      setMobileSidebarOpen(true);
  }

  const sidebar = (
    <ProfileBuilderSidebar
      canRedo={history.canRedo}
      canUndo={history.canUndo}
      document={editorDocument}
      hasUnsavedChanges={hasUnsavedChanges}
      invalidField={saveErrorField}
      mode={sidebarMode}
      onBack={requestExit}
      onBackToList={() => setSidebarMode("list")}
      onChange={changeDocument}
      onClose={desktopSidebar ? undefined : () => setMobileSidebarOpen(false)}
      onProfileLabelChange={(value) => {
        setProfileLabel(value);
        setSaveError(null);
        setSaveErrorField(null);
      }}
      onRedo={history.redo}
      onRetry={() => void handleSave()}
      onSave={() => void handleSave()}
      onSelect={handleSelect}
      onUndo={history.undo}
      profileLabel={profileLabel}
      saveError={saveError}
      saving={saving}
      saveStatus={saveStatus}
      selection={selection}
    />
  );

  return (
    <form className="min-h-dvh bg-background" ref={formRef}>
      <AlertDialog onOpenChange={setExitDialogOpen} open={exitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khi chưa lưu?</AlertDialogTitle>
            <AlertDialogDescription>
              Các thay đổi chưa lưu sẽ không xuất hiện trên hồ sơ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/dashboard")}
              type="button"
              variant="destructive"
            >
              Rời không lưu
            </AlertDialogAction>
            <Button
              disabled={saving}
              onClick={() => void saveAndExit()}
              type="button"
            >
              Lưu và rời
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!desktopSidebar ? (
        <Sheet onOpenChange={setMobileSidebarOpen} open={mobileSidebarOpen}>
          <SheetContent
            className="h-dvh !w-[min(22rem,calc(100vw-1rem))] max-w-none overflow-hidden rounded-none p-0"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              (event.currentTarget as HTMLElement).focus();
            }}
            showCloseButton={false}
            side="left"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Chỉnh sửa hồ sơ</SheetTitle>
            </SheetHeader>
            {sidebar}
          </SheetContent>
        </Sheet>
      ) : null}
      <div className="min-h-dvh lg:grid lg:grid-cols-[23.5rem_minmax(0,1fr)]">
        {desktopSidebar ? (
          <aside
            aria-label="Chỉnh sửa hồ sơ"
            className="sticky top-0 hidden h-dvh overflow-hidden bg-card lg:block"
          >
            {sidebar}
          </aside>
        ) : null}
        <div className="min-w-0">
          <header className="sticky top-0 z-40 flex min-h-16 items-center gap-3 bg-background/95 px-3 backdrop-blur-sm lg:hidden">
            <IconButton
              disabled={saving}
              onClick={requestExit}
              size="icon-lg"
              tooltip="Về dashboard"
              type="button"
              variant="ghost"
            >
              <ArrowLeft aria-hidden="true" />
            </IconButton>
            <Button
              className="ml-auto"
              onClick={() => setMobileSidebarOpen(true)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <SlidersHorizontal aria-hidden="true" /> Chỉnh sửa
            </Button>
          </header>
          <main>
            <section aria-label="Canvas hồ sơ" className="min-w-0">
              <PublicProfile
                document={editorDocument}
                profile={previewProfile}
                selection={{
                  disabled: saving,
                  onSelect: handleSelect,
                  selectedBlock: selection,
                }}
              />
            </section>
          </main>
        </div>
      </div>
    </form>
  );
}
