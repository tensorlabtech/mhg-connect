# Profile Builder Minimalism - Debug Audit

## Executive summary

- **Issue:** Minimalism pass introduced four concrete interaction/public-renderer defects.
- **Impact:** Public byline could show stray punctuation; edits made during publish appeared interactive but were discarded; inline focus could leave the wrong block selected; hidden/empty blocks were pointer-only.
- **Root cause:** Editor state was only partially represented in the shared renderer, separator logic used visibility instead of rendered content, and placeholder affordances remained generic `div` elements.
- **Status:** Confirmed defects fixed in `src/features/profile/*`; document/autosave/publish contracts unchanged.

## Confirmed findings

| Priority | Defect                                                                                    | Evidence                                                                                                         | Fix                                                                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Public byline rendered a leading/trailing `·` when only title or company had content      | Separator condition checked both visibility flags in public mode, not `shownTitle` and `shownCompany`.           | Public separator now requires both rendered values; editor mode retains separator between its two visible inline fields.                                                                                                     |
| P1       | Inline inputs accepted focus/typing while publish was active, but updates vanished        | `changeDocument` returned early during publish while shared renderer inputs remained enabled.                    | Added `editor.disabled`; inline inputs/textareas/placeholders and block settings selection are disabled during publish. Open editor overlays close when publish begins; mobile overflow settings/outline items are disabled. |
| P1       | Focusing an inline field could leave selection indicator/settings target on another block | Input click intentionally stopped bubbling to avoid opening the mobile Sheet, so block selection never updated.  | Added a separate focus-only callback via `BlockFrame.onFocusCapture`; it updates selection without opening settings.                                                                                                         |
| P1       | Hidden/empty blocks were not keyboard operable                                            | Placeholders were clickable only through an ancestor generic `div`; no focusable control represented the action. | Placeholders are now real `button type="button"` controls with focus-visible state and publish-disabled state.                                                                                                               |
| P2       | Loading spinners ignored reduced motion                                                   | Toolbar icons used unconditional `animate-spin`.                                                                 | Added `motion-reduce:animate-none` to publish and autosave spinners.                                                                                                                                                         |
| P2       | Structural block wrapper had unsupported naming semantics                                 | Generic non-focusable `div` carried `aria-label` despite no widget/landmark role.                                | Removed the redundant ARIA label; field controls and placeholder buttons own accessible names.                                                                                                                               |

## Audited behavior

- No focusable block wrapper contains inputs; inline controls remain the only nested field interactions.
- Global Cmd/Ctrl+Z handler exits for input, textarea, select, and contenteditable targets, preserving native text undo.
- Inline update paths retain stable coalescing keys for identity, bio, contact, and social fields.
- Mobile remains canvas-first; settings and outline use independent bottom Sheets capped at `82dvh` with safe-area bottom padding.
- Toolbar disables undo/redo/navigation mutations during publish; error and conflict remain text-labeled actions.
- Public renderer returns children directly when no editor adapter is supplied. Live `/q/DEMO-ACTIVE` HTML contained no inline fields, editor wrappers, inputs, textareas, or selection attributes.
- Renderer unit coverage now checks public/editor markup separation and the one-sided byline case.

## Verification

- `npm run typecheck` - passed.
- Focused ESLint for touched TS/TSX builder/public-profile files - passed with 0 errors.
- `npm test -- --run src/features/profile/public-profile.test.tsx` - 1 file, 2 tests passed.
- `curl -fsS http://127.0.0.1:3000/q/DEMO-ACTIVE` plus editor-marker scan - route returned HTML; 0 editor markers.
- `npm test` - 5 files, 13 tests passed.

## Files changed

- `src/features/profile/profile-builder.tsx`
- `src/features/profile/profile-builder-toolbar.tsx`
- `src/features/profile/public-profile.tsx`
- `src/features/profile/public-profile.css`
- `src/features/profile/public-profile.test.tsx`

## Unresolved questions

- Authenticated real-route keyboard/focus-return behavior for controlled Sheets still needs the parent visual QA pass; static/code audit cannot prove browser focus restoration after a menu-triggered controlled Sheet closes.
