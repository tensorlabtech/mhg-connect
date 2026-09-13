---
title: "Phase 2: Shared block renderer"
status: completed
---

# Phase 2: Shared block renderer

## Requirements

- [x] Render Identity, Bio, Contact, and Social from an allowlisted registry.
- [x] Use one renderer for public QR pages and the Builder canvas.
- [x] Keep vCard/download actions based on the published base-field adapter.
- [x] Gracefully skip hidden or invalid optional blocks.
- [x] Fold title, company, and location into Identity so no implicit section exists outside the document order.

## Validation

- Existing flat profiles render through fallback conversion.
- Published document order and visibility match the Builder preview.
