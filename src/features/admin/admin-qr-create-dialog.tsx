"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminQrAction } from "@/features/admin/qr-admin-actions";

export function AdminQrCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus /> Tạo mã QR
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo mã QR</DialogTitle>
          <DialogDescription>
            Nhập token sẽ in trên tem. Mã mới chưa thuộc tài khoản nào và sẵn
            sàng để khách kích hoạt.
          </DialogDescription>
        </DialogHeader>
        <form action={createAdminQrAction} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="public-token">Token trên tem</Label>
            <Input
              autoCapitalize="characters"
              autoComplete="off"
              id="public-token"
              maxLength={64}
              name="publicToken"
              pattern="[A-Za-z0-9-]+"
              placeholder="Ví dụ MHG-2026-001"
              required
              spellCheck={false}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Chỉ dùng chữ, số và dấu gạch ngang.
            </p>
          </div>
          <DialogFooter showCloseButton>
            <CreateQrButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateQrButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
      {pending ? "Đang tạo" : "Tạo và xem mã"}
    </Button>
  );
}
