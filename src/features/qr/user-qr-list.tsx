import { cn } from "cn";
import QRCode from "qrcode";

import { StatusBadge } from "@/components/product/status-badge";
import type { QrCardTextStyle } from "@/db/schema/product";
import type { QrCardOrientation } from "@/features/qr/qr-card-layout";
import { QrCardActions } from "@/features/qr/qr-card-actions";
import type { QrCardDesign } from "@/features/qr/qr-card-design";
import { getQrCardDesigns } from "@/features/qr/qr-data";
import { getQrCardPresets } from "@/features/qr/qr-card-preset-data";
import {
  isPresetCardBackground,
  type QrCardPreset,
} from "@/features/qr/qr-card-presets";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { runtimeEnv } from "@/lib/runtime-env";

type QrItem = {
  activatedAt: Date | null;
  cardBackgroundUrl: string | null;
  cardOrientation: QrCardOrientation;
  cardTagline: string;
  cardTextStyle: QrCardTextStyle;
  id: string;
  profileCompany: string | null;
  profileId: string | null;
  profileLocation: string | null;
  profileName: string | null;
  profileTitle: string | null;
  publicToken: string;
  scanCount: number;
  status: string;
  version: number;
};

type AssignmentProfile = {
  company: string | null;
  id: string;
  linkedQrCount: number;
  name: string;
  profileLabel: string | null;
  title: string | null;
};

type QrCardItem = QrItem & { designs: QrCardDesign[]; svg: string };

export async function UserQrList({
  items,
  profiles,
}: {
  items: QrItem[];
  profiles: AssignmentProfile[];
}) {
  const [designs, presets] = await Promise.all([
    getQrCardDesigns(items.map((item) => item.id)),
    getQrCardPresets(),
  ]);
  const cards = await Promise.all(
    items.map(async (item) => ({
      ...item,
      designs: designs.get(item.id) ?? [],
      svg: await QRCode.toString(buildPublicQrUrl(item.publicToken), {
        color: { dark: "#0a0a0a", light: "#ffffff" },
        errorCorrectionLevel: "H",
        margin: 4,
        type: "svg",
      }),
    })),
  );

  return (
    <div className="grid gap-4">
      {cards.map((qr) => (
        <QrOwnershipCard
          item={qr}
          key={qr.id}
          presets={presets}
          profiles={profiles}
        />
      ))}
    </div>
  );
}

function QrOwnershipCard({
  item,
  presets,
  profiles,
}: {
  item: QrCardItem;
  presets: QrCardPreset[];
  profiles: AssignmentProfile[];
}) {
  const profileName = item.profileName ?? "Chưa gắn hồ sơ";
  const role = [item.profileTitle, item.profileCompany]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn(
        "grid gap-4 rounded-surface bg-card p-4",
        item.cardOrientation === "landscape"
          ? "lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start"
          : "lg:grid-cols-[17rem_minmax(0,1fr)]",
      )}
    >
      <QrVisualCard
        backgroundUrl={item.cardBackgroundUrl}
        description={role}
        heading={profileName}
        location={item.profileLocation}
        orientation={item.cardOrientation}
        svg={item.svg}
        tagline={item.cardTagline}
        textStyle={item.cardTextStyle}
      />

      <section className="flex min-h-80 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="text-xl font-semibold tracking-[-0.02em] break-keep whitespace-nowrap text-gold">
              {item.publicToken}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Thông tin mã QR
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">
              Hồ sơ đang hiển thị
            </dt>
            <dd className="mt-2 text-sm font-medium">{profileName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Mẫu thẻ</dt>
            <dd className="mt-2 text-sm font-medium tabular-nums">
              {item.designs.length
                ? `Thẻ chính + ${item.designs.length} mẫu`
                : "Thẻ chính"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Lượt quét</dt>
            <dd className="mt-2 text-sm font-medium tabular-nums">
              {item.scanCount}
            </dd>
          </div>
        </dl>
        <QrCardActions
          activatedAt={item.activatedAt}
          backgroundUrl={
            item.cardBackgroundUrl
              ? isPresetCardBackground(item.cardBackgroundUrl)
                ? item.cardBackgroundUrl
                : `/api/qr-card-background/${item.id}?v=${item.version}`
              : null
          }
          description={role || "Quét để mở hồ sơ"}
          designs={item.designs}
          heading={profileName}
          location={item.profileLocation}
          presets={presets}
          profileId={item.profileId}
          profiles={profiles}
          publicToken={item.publicToken}
          qrId={item.id}
          scanCount={item.scanCount}
          status={item.status}
          svg={item.svg}
          orientation={item.cardOrientation}
          tagline={item.cardTagline}
          textStyle={item.cardTextStyle}
          version={item.version}
        />
      </section>
    </article>
  );
}

function buildPublicQrUrl(token: string) {
  const baseUrl = runtimeEnv.authUrl ?? "http://localhost:3000";
  return new URL(`/q/${encodeURIComponent(token)}`, baseUrl).toString();
}
