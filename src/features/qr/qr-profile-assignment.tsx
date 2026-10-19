"use client";

import { LoaderCircle, PencilLine, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignProfileToQrAction } from "@/features/qr/qr-profile-assignment-actions";

type PublishedProfile = {
  company: string | null;
  id: string;
  linkedQrCount: number;
  name: string;
  profileLabel: string | null;
  title: string | null;
};

export function QrProfileAssignment({
  currentProfileId,
  className,
  hideTrigger = false,
  onOpenChange,
  open,
  profiles,
  qrId,
  qrToken,
  version,
}: {
  className?: string;
  currentProfileId: string | null;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  profiles: PublishedProfile[];
  qrId: string;
  qrToken: string;
  version: number;
}) {
  const initialProfileId =
    profiles.find((profile) => profile.id === currentProfileId)?.id ??
    profiles[0]?.id ??
    "";
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId);

  if (!profiles.length) {
    return hideTrigger ? null : (
      <Button asChild className={className}>
        <Link href={`/profiles/new?qr=${encodeURIComponent(qrToken)}`}>
          <Plus /> Tạo hồ sơ để gắn
        </Link>
      </Button>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {!hideTrigger ? (
        <DialogTrigger asChild>
          <Button
            className={className}
            variant={currentProfileId ? "secondary" : "default"}
          >
            {currentProfileId ? <PencilLine /> : <Plus />}
            {currentProfileId ? "Đổi hồ sơ" : "Gắn hồ sơ"}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentProfileId ? "Đổi hồ sơ hiển thị" : "Gắn hồ sơ cho mã QR"}
          </DialogTitle>
          <DialogDescription>
            Mỗi mã QR hiển thị một hồ sơ. Chọn hồ sơ muốn khách nhìn thấy khi
            quét.
          </DialogDescription>
        </DialogHeader>
        <form action={assignProfileToQrAction} className="grid gap-6">
          <input name="expectedVersion" type="hidden" value={version} />
          <input name="profileId" type="hidden" value={selectedProfileId} />
          <input name="qrId" type="hidden" value={qrId} />
          <div
            aria-label="Hồ sơ hiển thị"
            className="grid gap-2"
            role="radiogroup"
          >
            {profiles.map((profile) => {
              const selected = selectedProfileId === profile.id;
              return (
                <button
                  aria-checked={selected}
                  className={cn(
                    "flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 rounded-overlay px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                    selected
                      ? "bg-secondary ring-1 ring-gold/70"
                      : "bg-secondary/55 hover:bg-secondary",
                  )}
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  role="radio"
                  type="button"
                >
                  <span className="min-w-0">
                    <strong className="block truncate text-sm font-medium text-foreground">
                      {profile.profileLabel ?? profile.name}
                    </strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {profile.title ? `${profile.title} · ` : ""}Đã gắn{" "}
                      {profile.linkedQrCount} mã QR
                    </span>
                  </span>
                  {selected ? (
                    <span className="shrink-0 text-xs font-medium text-gold">
                      Đang chọn
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <DialogFooter showCloseButton>
            <AssignButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? <LoaderCircle className="animate-spin" /> : null}
      {pending ? "Đang cập nhật" : "Lưu liên kết"}
    </Button>
  );
}
