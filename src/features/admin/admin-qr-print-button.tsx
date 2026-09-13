"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminQrPrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer /> In mã QR
    </Button>
  );
}
