"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DigitalIdentityCard,
  type DigitalCardFinish,
} from "./digital-identity-card";
import type { ComponentProps } from "react";

export function DigitalCardPreview(
  props: ComponentProps<typeof DigitalIdentityCard>,
) {
  const [finish, setFinish] = useState<DigitalCardFinish>(
    props.finish ?? "signature",
  );
  return (
    <div className="grid gap-4">
      <DigitalIdentityCard {...props} finish={finish} />
      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Xem bề mặt danh thiếp"
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
            size="sm"
            variant={finish === id ? "default" : "secondary"}
            aria-pressed={finish === id}
            onClick={() => setFinish(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Bề mặt xem thử trên thiết bị này; không thay đổi hồ sơ đã lưu.
      </p>
    </div>
  );
}
