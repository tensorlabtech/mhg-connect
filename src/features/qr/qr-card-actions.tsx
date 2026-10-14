"use client";

import {
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  PencilLine,
  Plus,
  QrCode,
  Repeat2,
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
import type { QrCardTextStyle } from "@/db/schema/product";
import type {
  QrCardFont,
  QrCardOrientation,
} from "@/features/qr/qr-card-layout";
import type { QrCardDesign } from "@/features/qr/qr-card-design";
import { QrProfileAssignment } from "@/features/qr/qr-profile-assignment";
import { QrCardPreviewDialog } from "@/features/qr/qr-card-preview-dialog";
import type { QrCardPreset } from "@/features/qr/qr-card-presets";

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
  backgroundUrl,
  description,
  designs,
  font,
  heading,
  location,
  orientation,
  presets,
  profileId,
  profiles,
  publicToken,
  qrId,
  scanCount,
  status,
  svg,
  tagline,
  textColor,
  textStyle,
  version,
}: {
  activatedAt: Date | null;
  backgroundUrl: string | null;
  description: string;
  designs: QrCardDesign[];
  font: QrCardFont;
  heading: string;
  location: string | null;
  orientation: QrCardOrientation;
  presets: readonly QrCardPreset[];
  profileId: string | null;
  profiles: AssignmentProfile[];
  publicToken: string;
  qrId: string;
  scanCount: number;
  status: string;
  svg: string;
  tagline: string;
  textColor: string | null;
  textStyle: QrCardTextStyle;
  version: number;
}) {
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  return (
    <>
      {backgroundUrl ? (
        <link as="image" href={backgroundUrl} rel="preload" />
      ) : null}
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
        <QrCardPreviewDialog
          backgroundUrl={backgroundUrl}
          description={description}
          designs={designs}
          font={font}
          heading={heading}
          location={location}
          onOpenChange={setCardOpen}
          open={cardOpen}
          orientation={orientation}
          presets={presets}
          publicToken={publicToken}
          qrId={qrId}
          status={status}
          svg={svg}
          tagline={tagline}
          textColor={textColor}
          textStyle={textStyle}
          version={version}
        />
        {profiles.length ? (
          <Button
            className="w-full"
            onClick={() => setAssignmentOpen(true)}
            type="button"
            variant="secondary"
          >
            <Repeat2 aria-hidden="true" />
            {profileId ? "Đổi hồ sơ hiển thị" : "Gắn hồ sơ có sẵn"}
          </Button>
        ) : (
          <Button asChild className="w-full" variant="secondary">
            <Link href={`/profiles/new?qr=${encodeURIComponent(publicToken)}`}>
              <Plus aria-hidden="true" /> Tạo hồ sơ để gắn
            </Link>
          </Button>
        )}
        <Button
          className="w-full"
          onClick={() => setCardOpen(true)}
          type="button"
          variant="secondary"
        >
          <QrCode aria-hidden="true" /> Thiết kế thẻ QR
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" variant="secondary">
              Thêm <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
    </>
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
