"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DigitalIdentityCard,
  type DigitalIdentity,
  type DigitalCardFinish,
} from "@/features/qr/digital-identity-card";
import { QrInteractiveSurface } from "@/features/qr/qr-interactive-surface";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { QrCardLayoutFields } from "@/features/qr/qr-card-layout-fields";
import { getQrCardFitError } from "@/features/qr/qr-card-fit";
import { withFlatCardCapture } from "@/features/qr/qr-card-capture";
import { downloadCardPng } from "@/features/qr/qr-card-download";
import type {
  QrCardOrientation,
  QrCardPosition,
} from "@/features/qr/qr-card-layout";
import type { LocalProfileDraft } from "./local-draft-store";

export function DraftCardWorkbench({
  identity,
  card,
  svg,
}: {
  identity: DigitalIdentity;
  card: LocalProfileDraft["card"];
  svg: string;
}) {
  const [mode, setMode] = useState<"digital" | "print">("digital");
  const [finish, setFinish] = useState<DigitalCardFinish>("signature");
  const [orientation, setOrientation] = useState<QrCardOrientation>("portrait");
  const [position, setPosition] = useState<QrCardPosition>("bottom");
  const [tagline, setTagline] = useState(card.tagline);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    setError(null);
    const target = ref.current;
    try {
      await document.fonts.ready;
      const url = await withFlatCardCapture(target, async () => {
        const issue = getQrCardFitError(target);
        if (issue) throw new Error(issue);
        const { toPng } = await import("html-to-image");
        return toPng(target, {
          pixelRatio: 3,
          cacheBust: true,
          // The centered preview's computed margins would shift the SVG clone.
          style: { margin: "0" },
        });
      });
      await downloadCardPng(url, `nhap-nguyen-van-thanh-${mode}.png`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể xuất thẻ nháp.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:items-start"
      aria-label="Danh thiếp nháp local"
    >
      <div className="min-w-0 py-5">
        <div
          className={
            mode === "print" && orientation === "portrait"
              ? "mx-auto max-w-xs"
              : "mx-auto w-full max-w-xl"
          }
          ref={ref}
        >
          {mode === "digital" ? (
            <DigitalIdentityCard
              identity={identity}
              svg={svg}
              logoUrl={card.logoUrl}
              logoName={card.logoName}
              logoPresentation={card.logoPresentation}
              finish={finish}
            />
          ) : (
            <QrInteractiveSurface label="Thẻ in nháp Nguyễn Văn Thanh">
              <QrVisualCard
                heading={identity.name}
                description={[identity.title, identity.company]
                  .filter(Boolean)
                  .join(" · ")}
                backgroundUrl={card.backgroundUrl}
                orientation={orientation}
                position={position}
                textStyle="shadow"
                svg={svg}
                logoUrl={card.logoUrl}
                logoName={card.logoName}
                logoPresentation={card.logoPresentation}
                tagline={tagline}
              />
            </QrInteractiveSurface>
          )}
        </div>
      </div>
      <div className="grid gap-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Loại thẻ"
        >
          <Button
            type="button"
            aria-pressed={mode === "digital"}
            variant={mode === "digital" ? "default" : "secondary"}
            onClick={() => setMode("digital")}
          >
            Danh thiếp 3D
          </Button>
          <Button
            type="button"
            aria-pressed={mode === "print"}
            variant={mode === "print" ? "default" : "secondary"}
            onClick={() => setMode("print")}
          >
            Thẻ in như chú Hòa
          </Button>
        </div>
        {mode === "digital" ? (
          <>
            <h2 className="text-lg font-medium">
              Ánh kim nhẹ, chuyển động theo con trỏ
            </h2>
            <div
              role="group"
              aria-label="Bề mặt danh thiếp"
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  ["signature", "Hắc kim"],
                  ["ivory", "Ngọc trai"],
                  ["foil", "Ánh kim"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  variant={finish === id ? "default" : "secondary"}
                  aria-pressed={finish === id}
                  onClick={() => setFinish(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Di chuyển chuột trên thẻ để xem nghiêng và ánh sáng. Trên điện
              thoại hoặc khi bật giảm chuyển động, thẻ đứng yên. Ảnh tải xuống
              luôn phẳng.
            </p>
          </>
        ) : (
          <QrCardLayoutFields
            idPrefix="draft-thanh"
            orientation={orientation}
            position={position}
            onOrientationChange={setOrientation}
            onPositionChange={setPosition}
            tagline={tagline}
            onTaglineCommit={setTagline}
            onTaglinePreview={setTagline}
          />
        )}
        <p className="text-sm leading-6 text-muted-foreground">
          Đây là bản nháp trên máy, chưa tạo tài khoản thật hoặc QR phát hành.
          QR nháp chỉ mở hồ sơ trên máy đang chạy local. Các lựa chọn ở đây chỉ
          dùng để xem thử, chưa lưu vào dữ liệu khách hàng.
        </p>
        <Button
          type="button"
          disabled={busy}
          className="w-fit"
          onClick={() => void download()}
        >
          {busy ? "Đang tạo ảnh…" : "Tải ảnh thẻ nháp"}
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
