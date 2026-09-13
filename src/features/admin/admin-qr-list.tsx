import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/product/status-badge";

type AdminQrItem = {
  id: string;
  ownerEmail: string | null;
  profileName: string | null;
  publicToken: string;
  scanCount: number;
  status: string;
};

export function AdminQrList({ items }: { items: AdminQrItem[] }) {
  return (
    <div className="grid gap-2">
      {items.map((qr) => (
        <Link
          className="group grid gap-4 rounded-surface bg-card p-5 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px md:grid-cols-[1.1fr_0.8fr_1.2fr_1.2fr_auto_auto] md:items-center md:px-6"
          href={`/admin/qr/${qr.id}`}
          key={qr.id}
        >
          <div>
            <p className="text-sm font-medium">{qr.publicToken}</p>
            <p className="mt-1 text-xs text-muted-foreground md:hidden">
              Token
            </p>
          </div>
          <StatusBadge status={qr.status} />
          <div className="min-w-0">
            <p className="truncate text-sm">
              {qr.ownerEmail ?? "Chưa có chủ sở hữu"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground md:hidden">
              Owner
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">
              {qr.profileName ?? "Chưa liên kết"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground md:hidden">
              Hồ sơ
            </p>
          </div>
          <div className="text-sm tabular-nums md:text-right">
            <span>{qr.scanCount}</span>
            <span className="ml-1 text-muted-foreground md:mt-1 md:ml-0 md:block md:text-xs">
              Lượt quét
            </span>
          </div>
          <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-1 md:block" />
        </Link>
      ))}
    </div>
  );
}
