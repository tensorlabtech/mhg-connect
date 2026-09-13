---
title: Refine profile builder sidebar
date: 2026-09-11
summary: "Refined the Profile Builder into a minimal card-based editor with coherent tabs, visibility, and publish behavior."
---

# Refine profile builder sidebar

## What happened

The Profile Builder sidebar was refined from a utility panel into a compact editor card. The pass added persistent Chỉnh sửa/Cài đặt tabs, rebuilt the save and publish header, simplified block ordering to drag-only, and replaced visibility switches with Eye/EyeOff controls.

## Decision

Field-level visibility is derived from non-empty values in the builder. Block-level visibility remains explicit. Existing published profiles continue honoring persisted visibility until the next publish, avoiding accidental legacy data exposure.

## Verification

All 21 Vitest tests, TypeScript, production build, and live desktop visual review passed. Lint has no errors and retains three unrelated existing warnings.

## Next steps

Continue from this sidebar/list/detail architecture when adding new block types or richer page-builder controls. AgentWiki publish skipped.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
