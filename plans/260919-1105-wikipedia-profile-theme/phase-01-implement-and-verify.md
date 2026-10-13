---
phase: 1
title: "Implement and visually verify the Bách khoa theme"
status: complete
priority: P1
effort: "small"
dependencies: []
---

# Phase 1: Implement and visually verify the Bách khoa theme

## Overview

Replace the pending archive presentation with an MHG Connect-owned editorial article structure, then prove it with focused tests and real responsive screenshots.

## Requirements

- Functional: retain the existing profile document, actions, links, visibility rules, preview and editing behavior.
- Visual: follow the layout mapping in [plan.md](./plan.md); omit both sidebars and all unsupported Wikipedia controls.
- Data: derive every rendered value from the current profile document; sparse data creates no empty UI.

## Implementation Steps

1. Register the visible name `Bách khoa` while retaining the existing internal style id for compatibility.
2. Rebuild the theme chrome and scoped CSS: masthead, article header/tool strip, prose column, right infobox, ruled sections and Wikipedia-like states.
3. Map identity, bio, contact, social and actions exactly as specified; prevent duplicate contact rendering.
4. Update the thumbnail and focused tests for complete/sparse data, links, actions and theme selection.
5. Run focused tests, typecheck/lint, then capture and compare desktop/tablet/mobile/Builder-preview screenshots against the supplied reference.

## Success Criteria

- [x] Theme is named `Bách khoa` everywhere visible; Wikipedia remains reference-only.
- [x] Both reference sidebars are absent; the remaining article structure is recognizably faithful.
- [x] No fake data or nonfunctional Wikipedia control appears.
- [x] Complete and sparse profiles pass automated and visual checks at all required widths.
- [x] Existing actions, links, Builder preview/editing and other themes regress neither functionally nor visually.

## Risk Assessment

- Theme-id rename can invalidate a locally saved pending document. Check for accepted persisted use first; if found, normalize only the old id to the new id.
- Infobox can squeeze prose at intermediate widths. Collapse to one column as soon as either column violates readable measure; do not force the desktop composition.
- Shared renderer changes can affect every theme. Keep structure additions/theme overrides scoped and visually smoke-test at least one other profile style.
