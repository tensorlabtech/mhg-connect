"use client";

import { useEffect, useRef } from "react";

export function ProfileLivingSurface() {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const surfaceElement = surface;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;

    function updatePointer(event: PointerEvent) {
      if (reducedMotion.matches) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        surfaceElement.style.setProperty(
          "--living-pointer-x",
          `${(event.clientX / window.innerWidth) * 100}%`,
        );
        surfaceElement.style.setProperty(
          "--living-pointer-y",
          `${(event.clientY / window.innerHeight) * 100}%`,
        );
      });
    }

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  return (
    <div aria-hidden="true" className="profile-living-surface" ref={surfaceRef}>
      <span className="profile-living-surface__field" />
      <span className="profile-living-surface__ribbon" />
      <span className="profile-living-surface__grain" />
    </div>
  );
}
