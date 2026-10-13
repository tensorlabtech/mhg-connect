"use client";

import { useEffect, useRef, useState } from "react";

import type { ProfileBlockType } from "@/features/profile/profile-document-types";

export function PublicProfileWikipediaAttribution() {
  return (
    <footer className="profile-wikipedia-attribution">
      Powered by <strong>MHG Connect</strong>
    </footer>
  );
}

export function ProfileWikipediaArticleNavigation({
  hasContact,
  hasSocial,
  onNavigate,
}: {
  hasContact: boolean;
  hasSocial: boolean;
  onNavigate?: (type: ProfileBlockType) => void;
}) {
  const sections = [
    { id: "profile-identity", label: "Bài viết", type: "identity" as const },
    ...(hasContact
      ? [{ id: "profile-contact", label: "Liên hệ", type: "contact" as const }]
      : []),
    ...(hasSocial
      ? [
          {
            id: "profile-social",
            label: "Liên kết ngoài",
            type: "social" as const,
          },
        ]
      : []),
  ];
  const [activeId, setActiveId] = useState("profile-identity");
  const observerLocked = useRef(false);
  const observerLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ids = [
      "profile-identity",
      ...(hasContact ? ["profile-contact"] : []),
      ...(hasSocial ? ["profile-social"] : []),
    ];
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (ids.includes(id)) setActiveId(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);

    const observer = new IntersectionObserver(
      (entries) => {
        if (observerLocked.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              Math.abs(first.boundingClientRect.top) -
              Math.abs(second.boundingClientRect.top),
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.25, 0.75] },
    );
    ids.forEach((id) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncHash);
      if (observerLockTimer.current) clearTimeout(observerLockTimer.current);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, [hasContact, hasSocial]);

  const activate = (id: string, type: ProfileBlockType) => {
    setActiveId(id);
    observerLocked.current = true;
    if (observerLockTimer.current) clearTimeout(observerLockTimer.current);
    observerLockTimer.current = setTimeout(() => {
      observerLocked.current = false;
    }, 800);
    onNavigate?.(type);

    const section = document.getElementById(id);
    if (onNavigate && section) {
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
    const target =
      id === "profile-identity"
        ? (section?.querySelector("h1") ?? section)
        : section;
    if (!target) return;
    target.setAttribute("data-profile-highlighted", "true");
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      target.removeAttribute("data-profile-highlighted");
    }, 700);
  };

  return (
    <nav className="profile-wikipedia-article-nav" aria-label="Mục bài viết">
      <span className="profile-wikipedia-article-tabs">
        {sections.map((section) => {
          const shared = {
            "aria-current":
              activeId === section.id ? ("location" as const) : undefined,
            "data-profile-navigation-link": true,
            onClick: () => activate(section.id, section.type),
          };
          return onNavigate ? (
            <button key={section.id} type="button" {...shared}>
              {section.label}
            </button>
          ) : (
            <a href={`#${section.id}`} key={section.id} {...shared}>
              {section.label}
            </a>
          );
        })}
      </span>
    </nav>
  );
}
