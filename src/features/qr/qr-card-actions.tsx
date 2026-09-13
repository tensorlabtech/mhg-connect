"use client";

import {
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  PencilLine,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrProfileAssignment } from "@/features/qr/qr-profile-assignment";

type AssignmentProfile = {
  company: string | null;
  id: string;
  linkedQrCount: number;
  name: string;
  profileLabel: string | null;
  title: string | null;
};

export function QrCardActions({
  activatedAt,
  profileId,
  profiles,
  publicToken,
  qrId,
  scanCount,
  version,
}: {
  activatedAt: Date | null;
  profileId: string | null;
  profiles: AssignmentProfile[];
  publicToken: string;
  qrId: string;
  scanCount: number;
  version: number;
}) {
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  return (
    <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
      <Button asChild className="w-full">
        <Link
          href={
            profileId
              ? `/profiles/${profileId}/edit`
              : `/profiles/new?qr=${encodeURIComponent(publicToken)}`
          }
        >
          {profileId ? <PencilLine /> : <Plus />}
          {profileId ? "Cập nhật hồ sơ" : "Tạo hồ sơ"}
        </Link>
      </Button>
      <QrProfileAssignment
        currentProfileId={profileId}
        hideTrigger
        onOpenChange={setAssignmentOpen}
        open={assignmentOpen}
        profiles={profiles}
        qrId={qrId}
        qrToken={publicToken}
        version={version}
      />
      <QrStatisticsDialog
        activatedAt={activatedAt}
        hideTrigger
        onOpenChange={setStatisticsOpen}
        open={statisticsOpen}
        scanCount={scanCount}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full" variant="secondary">
            Thao tác <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {profiles.length ? (
            <DropdownMenuItem onSelect={() => setAssignmentOpen(true)}>
              <PencilLine />
              {profileId ? "Đổi hồ sơ" : "Gắn hồ sơ"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link
                href={`/profiles/new?qr=${encodeURIComponent(publicToken)}`}
              >
                <Plus /> Tạo hồ sơ để gắn
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setStatisticsOpen(true)}>
            <BarChart3 /> Thống kê
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/q/${publicToken}`} target="_blank">
              <ExternalLink /> Xem trang đích
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function QrStatisticsDialog({
  activatedAt,
  hideTrigger = false,
  onOpenChange,
  open,
  scanCount,
}: {
  activatedAt: Date | null;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  scanCount: number;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {!hideTrigger ? (
        <DialogTrigger asChild>
          <Button className="w-full" variant="secondary">
            <BarChart3 /> Thống kê
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thống kê mã QR</DialogTitle>
          <DialogDescription>
            Dữ liệu cơ bản của mã QR này. Phân tích chi tiết sẽ được bổ sung khi
            có đủ dữ liệu sử dụng.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-6 pt-2">
          <div>
            <dt className="text-xs text-muted-foreground">Tổng lượt quét</dt>
            <dd className="mt-2 text-2xl font-medium tabular-nums">
              {scanCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Kích hoạt</dt>
            <dd className="mt-2 text-2xl font-medium leading-tight tabular-nums">
              {activatedAt
                ? new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "medium",
                  }).format(activatedAt)
                : "Chưa kích hoạt"}
            </dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
