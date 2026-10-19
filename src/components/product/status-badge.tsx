import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  available: "Chưa kích hoạt",
  locked: "Đang khóa",
};

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active"
      ? "text-success"
      : status === "locked"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Badge className={color} variant="secondary">
      {statusLabels[status] ?? status}
    </Badge>
  );
}
