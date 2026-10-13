import QRCode from "qrcode";

import { StatusBadge } from "@/components/product/status-badge";
import type { QrCardTextStyle } from "@/db/schema/product";
import { QrCardActions } from "@/features/qr/qr-card-actions";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { runtimeEnv } from "@/lib/runtime-env";

type QrItem = {
  activatedAt: Date | null;
  cardBackgroundUrl: string | null;
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

type QrCardItem = QrItem & { svg: string };

export async function UserQrList({
  items,
  profiles,
}: {
  items: QrItem[];
  profiles: AssignmentProfile[];
}) {
  const cards = await Promise.all(
    items.map(async (item) => ({
      ...item,
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
        <QrOwnershipCard item={qr} key={qr.id} profiles={profiles} />
      ))}
    </div>
  );
}

function QrOwnershipCard({
  item,
  profiles,
}: {
  item: QrCardItem;
  profiles: AssignmentProfile[];
}) {
  const profileName = item.profileName ?? "Chưa gắn hồ sơ";
  const role = [item.profileTitle, item.profileCompany]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-4 rounded-surface bg-card p-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <QrVisualCard
        backgroundUrl={item.cardBackgroundUrl}
        description={role}
        heading={profileName}
        location={item.profileLocation}
        svg={item.svg}
        textStyle={item.cardTextStyle}
      />

      <section className="flex min-h-80 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold tracking-[-0.02em] text-gold">
              {item.publicToken}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Thông tin mã QR
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">
              Hồ sơ đang hiển thị
            </dt>
            <dd className="mt-2 text-sm font-medium">{profileName}</dd>
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
              ? `/api/qr-card-background/${item.id}?v=${item.version}`
              : null
          }
          description={role || "Quét để mở hồ sơ"}
          heading={profileName}
          location={item.profileLocation}
          profileId={item.profileId}
          profiles={profiles}
          publicToken={item.publicToken}
          qrId={item.id}
          scanCount={item.scanCount}
          status={item.status}
          svg={item.svg}
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
