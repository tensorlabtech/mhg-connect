---
title: "Profile Builder V1"
description: "Structured block builder for profile creation and editing with safe draft and publish snapshots."
status: completed
priority: P1
effort: "large"
tags: [profile, builder, ui-ux, data-model]
created: 2026-09-11
---

# Profile Builder V1

## Overview

Replace the flat profile form with a professional structured builder: a real public-profile canvas, a contextual inspector, a collapsible outline, controlled block reordering, undo/redo, autosaved drafts, and an explicit publish boundary.

This is the extensible skeleton for a future CV/page builder. It remains intentionally constrained: block types and theme choices come from an allowlisted registry, and content stays in a single vertical flow.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Draft edits never interrupt the last published profile shown by linked QR codes | P0 |
| 2 | Canvas, outline, inspector, and public output share one versioned block document | P0 |
| 3 | Users can select, reorder, and hide optional blocks with undo/redo | P1 |
| 4 | The editor remains minimal, keyboard usable, and coherent on desktop and mobile | P1 |

## Constraints

- Preserve the dark / white / gold design system and reuse `src/components/ui`.
- Preserve existing flat profile columns as a compatibility/public-query seam during this migration.
- Identity is required and locked first; no free-positioning, pixel resize, nesting, custom CSS, or arbitrary HTML.
- Use the same registry renderer for Builder preview and public QR output.
- Keep deployment compatible with Next.js on Vercel, Postgres, and Vercel Blob.

## Non-goals

- Rich text, gallery, crop/focal point editing, revision history UI, collaboration, scheduled publishing, or per-QR content overrides.
- A general-purpose Elementor clone or a three-column layout that must remain permanently open.
- Production deployment in this plan.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Document and safe publishing](./phase-01-document-and-safe-publishing.md) | Completed |
| 2 | [Shared block renderer](./phase-02-shared-block-renderer.md) | Completed |
| 3 | [Builder shell and interactions](./phase-03-builder-shell-and-interactions.md) | Completed |
| 4 | [Migration, tests, and visual QA](./phase-04-migration-tests-and-visual-qa.md) | Completed |

## Success Criteria

- [x] Editing and autosaving an already published profile leaves its public QR output unchanged until Publish.
- [x] Builder document has a versioned, server-validated allowlist of block types.
- [x] Desktop exposes toolbar, collapsible outline, canvas, and contextual inspector without nested-card clutter.
- [x] Mobile exposes a clear Preview/Edit mode and never depends on drag gestures alone.
- [x] Identity stays locked first; optional block reorder works by drag handle and keyboard-accessible move controls; undo/redo restores document changes.
- [x] Publish updates every linked QR through the shared public renderer and explains the affected QR count.
- [x] Existing profiles migrate/fallback cleanly and new profiles can start from the current data defaults.
- [x] Unit, integration, typecheck, lint, build, and real-route desktop/mobile interaction QA pass.

## Risks and rollback

- JSON document drift is controlled by `schemaVersion`, Zod validation, and adapters back to flat columns.
- Optimistic version checks prevent an older editor tab from silently overwriting a newer draft.
- The migration is additive. The public route can fall back to flat columns if a document is absent or invalid.
- Builder pages can be reverted to the existing `ProfileForm` without rolling back stored flat profile data.

## Locked interaction decisions

- V1 ships exactly four stable blocks: Identity, Bio, Contact, and Social. The registry is extensible, but Add, Duplicate, and Delete wait until repeatable block semantics are introduced.
- Identity is mandatory, always visible, and locked first. Title, company, and location render inside Identity; the old implicit `Công việc` region is removed so outline order matches output order.
- History covers content, visibility, theme, and order. Selection, panels, device mode, save metadata, and server responses are excluded.
- Undo after publish creates a new unpublished draft. `Bỏ thay đổi` restores the last published snapshot (or the initial blank snapshot for a new profile).

## References

- [Product and UX research](../research/260911-1046-profile-builder-product-ux.md)
- [Existing UX refinement](../260911-1000-mhg-connect-ux-refinement/plan.md)

<!-- slug: profile-builder-v1 -->
