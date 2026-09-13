---
title: Profile Builder Sidebar Refinement
status: completed
priority: P1
effort: medium
branch: none
tags: [profile, builder, ui]
created: 2026-09-11
---

# Profile Builder Sidebar Refinement

## Outcome

Refine the accepted sidebar builder into a calmer card-based editor with clear Edit/Settings tabs, a compact colored status header, drag-only ordering, and content-driven field visibility.

## Constraints

- Keep the canvas visually identical to Profile View and remove its active gold marker.
- Preserve document, history, autosave, publish, QR, media, and public-route contracts.
- Reuse existing components and dark/white/restrained-gold tokens.
- Keep desktop and mobile behavior aligned through the same sidebar component.

## Non-goals

- No new block types, schema migration, free positioning, or upload backend changes.
- No redesign of the public profile content.

## Implementation

1. Restyle desktop sidebar as an inset rounded sticky card.
2. Add top-level `Chỉnh sửa` and `Cài đặt` tabs; Edit owns block list/detail, Settings owns document/theme settings.
3. Rebuild header with Back, profile name, colored save icon, then Undo/Public/Publish actions directly below.
4. Remove move-up/down controls; retain pointer and keyboard drag on handles.
5. Replace block visibility switches with Eye/EyeOff icon buttons in list and detail headings.
6. Remove field-level visibility controls; non-empty values render automatically, empty values stay hidden.
7. Replace header-layout radio rows with compact ratio thumbnails ready for future imagery.
8. Remove selected gold marker from canvas while preserving click-to-edit behavior.

## Acceptance criteria

- Desktop sidebar is inset, rounded, sticky, and visually separated without shadow.
- `Chỉnh sửa` and `Cài đặt` tabs are always clear; Identity lives inside Edit.
- Header shows Back, name, right-aligned colored save status and a second action row with Undo and Publish.
- Block list has drag handle plus Eye/EyeOff only; no up/down buttons or switches.
- Detail heading aligns block title with its Eye/EyeOff button.
- Identity/contact/social field-level switches are removed; blank fields do not render in canvas/public profile.
- Settings header-layout choices use consistent image-ratio placeholders.
- Canvas has no gold active marker, inputs, or active links.
- Desktop/mobile/public routes pass visual and technical regression checks.

## Risks and rollback

- Content-driven visibility must remain compatible with stored legacy visibility flags without changing schema.
- Keyboard drag remains the accessible reorder path after removing explicit move buttons.
- Rollback restores the previous sidebar presentation; no data migration is required.

## Verification

- `npm test -- --run`: 7 files, 21 tests passed.
- `npm run typecheck` and `npm run build`: passed.
- `npm run lint -- --max-warnings=10`: 0 errors; 3 unrelated existing warnings.
- Live desktop and 390×844 mobile checks passed for block list, detail inspector, Settings thumbnails, sticky editor header, public profile, and horizontal overflow.
