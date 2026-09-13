---
title: "Phase 1: Document and safe publishing"
status: completed
---

# Phase 1: Document and safe publishing

## Requirements

- [x] Define the versioned `ProfileDocument` and block registry contract.
- [x] Add separate draft and published snapshots plus optimistic document versioning.
- [x] Preserve flat columns as the published compatibility snapshot.
- [x] Autosave must never change public status or link a waiting QR.
- [x] Publish validates the document, copies the published base fields, and links a waiting QR transactionally.

## Validation

- Unit tests for document parsing, fallback conversion, ordering, and base-field extraction.
- Integration coverage proving draft autosave does not alter a published QR snapshot.

## Rollback

Additive schema columns can remain unused while the old form continues to operate.
