"use client";

import {
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  UnlockKeyhole,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminQrAction } from "@/features/admin/qr-admin-actions";

export function AdminQrActions({
  id,
  status,
  version,
}: {
  id: string;
  status: string;
  version: number;
}) {
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-3">
        {status === "active" ? (
          <ConfirmAction
            description="Lần quét tiếp theo sẽ thấy thông báo hồ sơ đang tạm khóa."
            icon={<LockKeyhole />}
            id={id}
            label="Khóa mã"
            operation="lock"
            status={status}
            version={version}
          />
        ) : null}
        {status === "locked" ? (
          <ConfirmAction
            description="Hồ sơ đang liên kết sẽ hoạt động lại ngay ở lần quét tiếp theo."
            icon={<UnlockKeyhole />}
            id={id}
            label="Mở khóa"
            operation="unlock"
            status={status}
            version={version}
          />
        ) : null}
      </div>
      <div>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">
          Reset gỡ chủ sở hữu và hồ sơ đang liên kết. Tài khoản và hồ sơ cũ
          không bị xóa.
        </p>
        <ConfirmAction
          destructive
          description="Mã trở lại trạng thái chưa kích hoạt và có thể được tài khoản khác nhận."
          icon={<RotateCcw />}
          id={id}
          label="Reset mã QR"
          operation="reset"
          status={status}
          version={version}
        />
      </div>
    </div>
  );
}

function ConfirmAction({
  description,
  destructive = false,
  icon,
  id,
  label,
  operation,
  status,
  version,
}: {
  description: string;
  destructive?: boolean;
  icon: React.ReactNode;
  id: string;
  label: string;
  operation: "lock" | "unlock" | "reset";
  status: string;
  version: number;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={destructive ? "destructive" : "secondary"}>
          {icon}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <form action={adminQrAction}>
            <input name="expectedStatus" type="hidden" value={status} />
            <input name="expectedVersion" type="hidden" value={version} />
            <input name="id" type="hidden" value={id} />
            <input name="operation" type="hidden" value={operation} />
            <AdminQrSubmitButton destructive={destructive} />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminQrSubmitButton({ destructive }: { destructive: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      disabled={pending}
      type="submit"
      variant={destructive ? "destructive" : "default"}
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : null}
      {pending ? "Đang cập nhật…" : "Xác nhận"}
    </Button>
  );
}
