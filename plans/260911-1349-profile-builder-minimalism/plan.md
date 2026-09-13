# Profile Builder Minimalism

Status: superseded

Superseded on 2026-09-11 by [Profile View Reset](../260911-1438-profile-view-reset/plan.md) after the visible Builder direction was rejected. The implementation remains in the codebase but is temporarily hidden.

## Outcome

Turn the existing profile editor into a document-first experience: users edit content directly on the profile, while the settings panel is reserved for media, visibility, layout, and publishing.

## Constraints

- Preserve the existing profile document, autosave, history, conflict, publish, QR, and public rendering contracts.
- Reuse the project design system and fixed dark, white, and restrained gold direction.
- Keep the public profile visually unchanged outside editor-only states.
- Support keyboard interaction and responsive desktop/mobile editing.

## Non-goals

- Free-form positioning, arbitrary columns, or Elementor-level layout controls.
- New block types, schema migrations, or rich-text formatting.
- Replacing the media upload/storage implementation.

## Phases

1. Add inline editing to the shared profile canvas for identity, bio, contact, and social content.
2. Simplify the editor shell and toolbar; reduce persistent chrome and move mobile settings into a sheet.
3. Reduce the settings panel to structural options and visibility controls.
4. Verify technical checks and real desktop/mobile interactions in the browser.

## Acceptance criteria

- Name, title, company, location, bio, contact, and social values can be edited in place.
- Block selection remains visible without permanent gold outlines or decorative cards.
- Desktop keeps a compact settings panel; mobile uses the canvas first and opens settings on demand.
- Outline, reorder, undo/redo, autosave, publish, media selection, and public preview remain usable.
- No horizontal overflow at desktop and mobile widths; focus and popup states are visible.

## Risks and rollback

- Shared renderer regression: editor-only controls must be guarded by the editor prop; public route remains static markup.
- History noise: inline updates use stable coalescing keys.
- Roll back the editor shell, settings panel, shared renderer, and editor-only CSS together; no data migration is involved.

## Completion evidence

- Typecheck passed; 5 test files with 14 tests passed; lint passed with 3 pre-existing warnings outside this scope.
- Authenticated edit route verified on desktop and at 375 x 812.
- Mobile menu items, sheet close, and outline visibility targets measured at 44 x 44; no horizontal overflow was observed.
- Public `/q/DEMO-ACTIVE` rendered without editor inputs, selection markers, or editor controls.
- Final code review verdict: PASS with no remaining P0/P1 findings.
