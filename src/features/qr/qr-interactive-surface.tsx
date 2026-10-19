"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { getCardMotion, getTiltFromOrientation } from "./qr-card-motion";
import "./qr-interactive-surface.css";

type OrientationPermission = { requestPermission?: () => Promise<string> };

/** View-only presentation: the actual QR/text and export target stay separate. */
export function QrInteractiveSurface({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const gyroOn = useRef(false);
  const askedPermission = useRef(false);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);

  function apply(host: HTMLDivElement, x: number, y: number) {
    const next = getCardMotion(x, y);
    host.style.setProperty("--card-rotate-x", `${next.rotateX}deg`);
    host.style.setProperty("--card-rotate-y", `${next.rotateY}deg`);
    host.style.setProperty("--card-glare-x", `${next.glareX}%`);
    host.style.setProperty("--card-glare-y", `${next.glareY}%`);
    host.dataset.tiltActive = "true";
  }
  function settle(host: HTMLDivElement) {
    host.dataset.tiltActive = "false";
    for (const name of ["--card-rotate-x", "--card-rotate-y"])
      host.style.setProperty(name, "0deg");
    host.style.setProperty("--card-glare-x", "50%");
    host.style.setProperty("--card-glare-y", "50%");
  }
  const editing = (host: HTMLElement) =>
    Boolean(host.querySelector('[data-card-editing="true"]'));
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Điện thoại không có chuột: thẻ tự nghiêng nhẹ, nghiêng theo cảm biến khi có, và theo ngón tay khi kéo ngang.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || reducedMotion()) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (!editing(host)) host.dataset.tiltAuto = "true";
    let frame = 0;
    function onOrientation(event: DeviceOrientationEvent) {
      if (!host || dragging.current || editing(host)) return;
      if (event.beta == null || event.gamma == null) return;
      baseline.current ??= { beta: event.beta, gamma: event.gamma };
      const { x, y } = getTiltFromOrientation(
        event.beta - baseline.current.beta,
        event.gamma - baseline.current.gamma,
      );
      gyroOn.current = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => apply(host, x, y));
    }
    window.addEventListener("deviceorientation", onOrientation);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  function down(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || reducedMotion()) return;
    dragging.current = true;
    // iPhone chỉ cho đọc cảm biến nghiêng sau khi người dùng chạm và đồng ý một lần.
    const permission = (
      globalThis.DeviceOrientationEvent as unknown as OrientationPermission
    )?.requestPermission;
    if (permission && !askedPermission.current) {
      askedPermission.current = true;
      permission().catch(() => undefined);
    }
    move(event);
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      dragging.current = false;
      if (gyroOn.current) return;
    }
    settle(event.currentTarget);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion()) return;
    if (event.pointerType === "touch" && !dragging.current) return;
    const host = event.currentTarget;
    if (editing(host)) return;
    // Measure the stationary outer host, not the transformed plane: avoids jitter.
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    apply(
      host,
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
  }
  return (
    <div
      ref={hostRef}
      className="qr-interactive-surface"
      data-card-interactive
      aria-label={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      <div className="qr-interactive-plane">{children}</div>
    </div>
  );
}
