"use client";

import type { PointerEvent, ReactNode } from "react";
import { getCardMotion } from "./qr-card-motion";
import "./qr-interactive-surface.css";

/** View-only presentation: the actual QR/text and export target stay separate. */
export function QrInteractiveSurface({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  function reset(event: PointerEvent<HTMLDivElement>) {
    const host = event.currentTarget;
    host.dataset.tiltActive = "false";
    for (const name of ["--card-rotate-x", "--card-rotate-y"])
      host.style.setProperty(name, "0deg");
    host.style.setProperty("--card-glare-x", "50%");
    host.style.setProperty("--card-glare-y", "50%");
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const host = event.currentTarget;
    // Measure the stationary outer host, not the transformed plane: avoids jitter.
    if (host.querySelector('[data-card-editing="true"]')) return;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const next = getCardMotion(
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
    host.style.setProperty("--card-rotate-x", `${next.rotateX}deg`);
    host.style.setProperty("--card-rotate-y", `${next.rotateY}deg`);
    host.style.setProperty("--card-glare-x", `${next.glareX}%`);
    host.style.setProperty("--card-glare-y", `${next.glareY}%`);
    host.dataset.tiltActive = "true";
  }
  return (
    <div
      className="qr-interactive-surface"
      data-card-interactive
      aria-label={label}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div className="qr-interactive-plane">{children}</div>
    </div>
  );
}
