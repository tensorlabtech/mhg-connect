"use client";

import { Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getQrCardFitError } from "@/features/qr/qr-card-fit";

export function AdminQrPrintButton() {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-2">
      <Button
        onClick={async () => {
          await document.fonts.ready;
          const issue = getQrCardFitError(document);
          setError(issue);
          if (!issue) window.print();
        }}
      >
        <Printer /> In mã QR
      </Button>
      {error ? (
        <p role="alert" className="max-w-sm text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
