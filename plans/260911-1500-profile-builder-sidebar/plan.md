---
title: Profile Builder Sidebar
status: completed
priority: P1
effort: medium
branch: none
tags: [profile, builder, ui]
created: 2026-09-11
completed: 2026-09-11
---

# Profile Builder Sidebar

Superseded as the active visual specification on 2026-09-11 by [Profile Builder Sidebar Refinement](../260911-1540-profile-builder-sidebar-refinement/plan.md).

Status: completed
Progress: 100% (9/9 acceptance criteria verified)

## Outcome

Turn the accepted full-page Profile View into a simple professional builder: a single left sidebar owns navigation, block order, and all field editing; the right canvas remains visually faithful to the published profile.

## Constraints

- Reuse the existing document, history, autosave, publish, media, outline, and inspector contracts.
- Keep editing controls out of the profile canvas.
- Preserve public `/q/[token]` rendering and actions.
- Use existing UI components and dark/white/restrained-gold tokens.
- Desktop uses a persistent left sidebar; mobile exposes the same sidebar content through one compact sheet trigger.

## Non-goals

- No arbitrary positioning, columns, resizing, new block types, schema changes, or new storage behavior.
- No redesign of the public profile.
- No second inspector or right-side settings panel.

## Implementation

1. Replace the temporary View gate with a lean builder shell: left sidebar plus full profile canvas.
2. Keep block list and reorder controls in the sidebar; selecting a block shows its detail form in the same sidebar.
3. Move identity, bio, contact, and social content fields into their inspectors with labels and placeholders.
4. Let static canvas regions select their matching block without rendering inline inputs.
5. Keep back, save state, undo/redo, public preview, and publish actions compact and subordinate.
6. Reuse the same sidebar composition inside a mobile sheet.
7. Verify autosave/publish contracts, public renderer regression, keyboard interaction, and desktop/mobile layout.

The sidebar uses one shared navigation state: `list` shows the reorderable structure; `detail(selection)` replaces it with the selected inspector and a clear return to “Cấu trúc”. Header and footer remain fixed while the body scrolls.

## Acceptance criteria

- Desktop has exactly one persistent left sidebar and no right inspector.
- Sidebar includes Back, block order/reorder, selected-block detail fields, save state, undo/redo, and Publish.
- Clicking a visible profile block selects it and updates the sidebar inspector; the canvas contains no input or textarea.
- Canvas contact/social rows are inert in builder mode and cannot open a private `tel:` or external link.
- All existing profile content fields are editable from the sidebar with labels and useful placeholders.
- Drag/drop and keyboard reorder remain available.
- Mobile can open the same editing surface without horizontal overflow.
- Public `/q/[token]` remains visually and behaviorally unchanged.
- A publish validation error opens the matching detail panel, opens the mobile sidebar when needed, and focuses the invalid field.

## Risks and rollback

- Shared renderer selection must be additive and inert unless explicitly supplied by the private builder.
- Inspector field updates must retain stable coalescing keys to avoid noisy history.
- Rollback restores the temporary View gate; no data migration is involved.

## Completion evidence

| Area | Result | Evidence |
|---|---|---|
| Desktop/sidebar structure | Pass | One persistent 22rem left sidebar; no right inspector in browser QA and source review |
| Sidebar editing surface | Pass | Back, structure/detail, all fields, reorder, save state, undo/redo, preview, and publish verified |
| Selection-only canvas | Pass | Correct inspector selection; no canvas input/textarea or private directory links |
| Reorder and publish safety | Pass | Pointer/keyboard reorder preserved; all mutations disabled while publishing |
| Validation recovery | Pass | Invalid field opens correct detail/mobile Sheet and receives focus |
| Mobile/responsive | Pass | Shared Sheet surface passed at 375px with no horizontal overflow |
| Public regression | Pass | `/q/DEMO-ACTIVE` retained normal content, links, and actions |
| Quality gates | Pass | Typecheck; 7 test files / 19 tests; lint with 0 errors |
| Review | Pass | Code review reported no findings or blockers |

This small plan has no phase files. The seven implementation items and nine acceptance criteria are the complete work breakdown; all were reconciled against `reports/debug-report.md`, `reports/test-report.md`, and `reports/code-review.md`.

## Documentation impact

`README.md` now describes the active Sidebar Builder, selection-only canvas, draft autosave boundary, and current new/edit route behavior. No additional evergreen documentation update is required.

## Unresolved questions

None.
