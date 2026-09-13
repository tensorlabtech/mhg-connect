# Profile Builder minimalism: UI/UX implementation review

## Verdict

The plan has the correct product boundary and can proceed without changing the document, draft/publish, autosave, history, QR, or public rendering contracts. The main correction is to define "direct editing" and mobile behavior precisely enough that implementation does not become the same form in a smaller panel.

The professional-minimal target is a profile document with editing affordances, not an editor shell containing a profile preview. Public markup and appearance must remain the baseline; editing controls appear only on hover, focus, active edit, empty state, or explicit selection.

## Design read

- Reading this as: a profile-document editor for non-technical MHG users, with a quiet, high-trust product language, leaning refined minimalism.
- Seeded variation: the 44-character request maps to Organic / natural in the skill menu. That direction conflicts with the already accepted fixed dark, white, gold system, so the existing Luxury / refined project direction remains authoritative.
- Aesthetic thesis: refined minimalism for profile owners: near-black, warm white, sparse gold, restrained editorial type, document-first composition, and one memorable behavior where the published profile itself becomes the editor.
- Product dials: variance 3, motion 2, density 4. Motion is limited to 150-250ms state feedback; there is no page-load choreography.
- Explicit project exception: Playfair Display is retained because it is an established MHG token, even though the generic frontend-design skill normally discourages it. It remains display-only; Builder controls use Be Vietnam Pro.

## Plan refinements required

1. Phase 1 should define field-level editing, not only block selection. Required editable paths are:
   - `identity.name`, `identity.title`, `identity.company`, `identity.location`
   - `bio.text`
   - `contact.phone`, `contact.contactEmail`, `contact.website`
   - `social.zalo`, `social.linkedIn`, `social.telegram`
2. Phase 1 must forbid a focusable block wrapper containing inputs. The current `BlockFrame` uses `role="button"` and `tabIndex=0`; keeping that wrapper after adding inputs would create nested interactive controls and confusing keyboard behavior.
3. Phase 2 should explicitly remove the mobile Preview/Edit tabs. Mobile is always canvas-first; settings open only after a field/block tap or the settings action.
4. Phase 2 should specify a bottom `Drawer` on mobile, not a squeezed right inspector or left desktop Sheet. Outline may remain a Sheet on desktop, but bottom presentation is more coherent on touch devices.
5. Phase 3 should list exactly what remains in settings. Otherwise content fields are likely to be duplicated in both Canvas and Inspector.
6. Acceptance should include public/editor markup parity, mobile keyboard behavior, native text undo behavior, long values, and focus return after overlays close.

## Recommended component boundaries

### `profile-builder.tsx`: orchestration only

Own document history, autosave, publish, pending media, selection, active editable field, overlay state, and device preview state. Do not keep detailed Canvas or Inspector composition in this file.

Suggested state split:

- `selection`: block/document selection for structural settings.
- `activeField`: a typed field path or `null` for field editing.
- `settingsOpen`: only needed below the persistent-inspector breakpoint.
- `outlineOpen`: independent of settings.

Changing content must continue to call `history.update(document, stableCoalesceKey)`. Selection, overlay state, and focus state must not enter history.

### `public-profile.tsx`: shared renderer plus guarded editor adapter

Keep public output as the default. Extend the optional `editor` contract with field-level callbacks and active-field state. Do not add `"use client"` solely for this feature; the module can stay server-compatible and become part of the client graph only when imported by the Builder.

Introduce a small typed field component, either colocated or in a dedicated `profile-inline-editable-field.tsx`:

- Idle state renders the same text/typography as public output.
- Focus or activation swaps only that value for an `input` or `textarea` styled with inherited typography.
- Empty visible fields render a concise editor-only add affordance.
- Hidden fields do not render on the profile; they remain recoverable from settings.
- Each field has an explicit accessible name, input type, max length, and stable coalescing key.

Avoid `contentEditable`. Controlled `input`/`textarea` elements preserve React state, mobile keyboards, selection, validation, and accessibility more reliably.

`BlockFrame` should become a non-focusable structural container. Field controls provide keyboard access. Empty or hidden block placeholders may be real buttons because they contain no nested controls.

### `profile-builder-inspector.tsx`: routing only

Route selection to narrow settings sections. Content values must not appear here after direct editing lands.

- Document: header layout, public-impact copy, reset draft.
- Identity: avatar, cover, visibility switches for title/company/location.
- Bio: block visibility only.
- Contact: block visibility plus phone/email/website visibility switches.
- Social: block visibility plus Zalo/LinkedIn/Telegram visibility switches.

Use a compact sans-serif title. Remove every literal `Inspector` kicker and repeated explanatory paragraph. Descriptions remain only for consequences that are not obvious, such as reset or number of linked QR codes.

### `profile-builder-inspector-fields.tsx`: structural controls

Retire Inspector-owned `TextField` usage for profile content. Keep reusable visibility rows and layout-choice rows. A row should use one surface or one divider, not background, border, and nested card together.

### `profile-builder-toolbar.tsx`: one navigation cluster, one action cluster

Desktop:

- Left: Back, current profile name, save state.
- Right: Undo, Redo, Outline, compact viewport switch, optional public-view icon, Publish.
- Keep Publish as the only visually primary action.

Mobile at 375px:

- Back, truncated profile name/save state, Publish, overflow.
- Overflow contains Outline, Settings, Undo, Redo, and View public. Undo/Redo remain touch accessible, but do not consume permanent toolbar width.
- Do not duplicate an Outline button above the Canvas.

Save errors/conflicts remain actionable and must not be represented by color alone. The spinner must stop under reduced motion.

### `profile-builder-outline.tsx`: on-demand structure only

Keep reorder, visibility, explicit up/down buttons, and announcements. Increase every icon action's effective touch target to at least 44x44; current `icon-sm` and `icon-xs` controls are 36px and 32px. Preserve a clear selected row without a permanent gold border.

Desktop may use a left Sheet. Mobile should use a bottom Drawer or a mobile-specific bottom Sheet. Closing it must return focus to the trigger. Drag is enhancement only; up/down controls remain the deterministic path.

### `profile-media-picker.tsx`: compact media-only workflow

Keep it in Identity settings. Present avatar and cover as two compact rows with preview plus Change action; open the existing dialog for preset/upload detail. Remove demo-implementation copy from the main Inspector. In the dialog, ensure preset grids collapse safely at 375px and selection is conveyed by `aria-pressed` plus a non-color check indicator.

### `public-profile.css`: editor states only, public appearance stable

- Remove the gold pill block label.
- Remove permanent broad block outlines.
- Use a single subtle signal: a low-contrast field background/underline on hover and a 2px gold `focus-visible` ring during editing.
- Do not combine preview outer border, block outline, field ring, and label at the same time.
- Idle editor Canvas should visually match public output as closely as possible.
- Retain the public profile's existing typography and spacing; editor CSS must be scoped under editor-only data attributes/classes.

## Desktop behavior

- At wide desktop, the profile occupies the visual center and the settings panel stays compact at roughly 20-22rem with one left hairline. Prefer the persistent Inspector only at `xl`; at narrower laptop widths, open settings as a Sheet so the document is not compressed.
- Remove the `Canvas` label, helper sentence, muted Canvas band, and duplicate Structure action.
- Device width is a preview constraint, not another card. If a viewport boundary is needed, use one restrained hairline; do not add shadow.
- Clicking text edits that exact field. Clicking non-field block space selects its settings. Clicking an empty visible block starts its first useful field.
- Selection should survive autosave and viewport switching. Publishing disables mutations but must not cause layout shift.

## Mobile behavior

- Default view is the profile Canvas immediately below the compact toolbar. There is no Preview/Edit mode switch.
- Tapping a visible value opens a bottom Drawer focused on that exact field, or activates an inline input if the implementation proves stable with the virtual keyboard. Do not show the entire block form by default.
- Tapping block settings opens a bottom Drawer containing media/visibility/layout only.
- The Drawer should cap near 80dvh, scroll internally, respect the safe-area inset, keep the active input above the virtual keyboard, and return focus to the originating field when closed.
- At 375px there must be no horizontal scrolling, no clipped publish action, no three-column media grid, and no fixed action cluster covering profile content.

## Accessibility and interaction requirements

- Do not intercept `Cmd/Ctrl+Z` when the event target is an input, textarea, select, or contenteditable element. Native text undo must work during field editing; Builder Undo/Redo remains available from controls and outside text fields.
- Single-line fields: Enter commits/blurs; Escape exits editing. Bio: Enter creates a newline; Escape exits.
- Use real labels or `aria-label` for every inline field. Placeholder text is not a label.
- Apply schema limits client-side: name 100, title/company/location 120, bio 700, email 254, phone 40, website/LinkedIn 240, Telegram/Zalo 80.
- Use `type="email"`, `type="url"`, `type="tel"`, and suitable `inputMode`/`autoComplete` values where applicable.
- On publish validation failure, focus the invalid field, not only the containing block.
- Focus rings need at least 3:1 contrast and may not be clipped by preview overflow.
- All touch targets are at least 44x44. Inputs stay at least 16px on mobile to avoid browser zoom.
- Autosave state uses a polite live region; conflict/error retry remains a real button with visible text.
- Drawer, Sheet, Dialog, menu, tooltip, and DnD announcements must be tested while open/active, not only through their triggers.
- State motion is 150-250ms and limited to opacity, color, and transform. No `transition: all`; respect `prefers-reduced-motion`.

## Acceptance checks

### Contract and regression

- Public `/q/[token]` has no inputs, editor labels, selection attributes, or editor-only spacing changes.
- The same draft document renders in Canvas and public renderer with matching idle layout.
- Autosave, optimistic version conflict, publish snapshot, linked QR update, reset, and pending avatar behavior remain unchanged.
- Each field update has a stable coalescing key; typing a sentence does not create one undo step per character.

### Desktop real-route QA

- Verify the real edit route at 1280px and 1440px, not only a component harness.
- Edit every field directly; test empty, long, hidden, and restored values.
- Exercise hover, focus-visible, active edit, disabled publishing, saving, saved, error, and conflict states.
- Open Outline, reorder by drag and buttons, toggle visibility, close by Escape, and confirm focus return.
- Switch mobile/desktop preview width without losing field focus or content.
- Publish and open the public QR route to confirm editor controls are absent.

### Mobile real-route QA

- Verify at 375x812 and one shorter viewport with the software keyboard open.
- Edit name, multiline bio, URL, phone, and one social field.
- Open/close settings, outline, media dialog, overflow menu, and tooltips where relevant.
- Undo/redo, reorder, visibility, autosave retry, and Publish remain reachable.
- Scroll the entire profile and confirm no horizontal overflow or sticky control covering content.

### Visual self-review gate

- Literal `Canvas` and `Inspector` labels: 0.
- Duplicate Structure triggers in the same viewport: 0.
- Permanent gold block outlines/pills: 0.
- Primary actions per view: 1 (`Xuất bản`).
- Gold remains limited to primary action, focus/selection, and meaningful existing profile accents.
- Inspector content fields duplicated from Canvas: 0.
- Public profile visual regressions: 0 by desktop/mobile screenshot comparison.
- Interactive targets below 44x44 on touch layouts: 0.

## Priority risks

1. **P0: nested interaction semantics.** Adding inputs inside the current focusable `BlockFrame` is invalid and will make keyboard/screen-reader behavior worse.
2. **P0: public renderer drift.** Direct-edit controls must be strictly editor-gated, with screenshot comparison of public output before completion.
3. **P0: mobile becoming a form again.** A full Inspector behind an Edit tab does not satisfy document-first UX; field or contextual bottom drawers are required.
4. **P1: global undo stealing native input undo.** Update shortcut routing before inline fields ship.
5. **P1: focus clipping.** Current preview uses `overflow: hidden`; an outer focus ring can disappear. Use inset/editor-safe focus treatment or remove clipping at the focused boundary.
6. **P1: toolbar overcrowding at 375px.** Move secondary actions to overflow instead of shrinking touch targets or text.

## Implementation order

1. Define typed editable field paths and the document update adapter.
2. Refactor `BlockFrame` semantics before introducing any inputs.
3. Add desktop direct editing and editor-only CSS while preserving idle/public parity.
4. Strip content fields from Inspector and simplify media/visibility/layout groups.
5. Simplify desktop toolbar and Canvas chrome.
6. Replace mobile tabs with Canvas-first drawers and overflow actions.
7. Run focused tests, typecheck/lint/build, then complete real-route desktop/mobile visual and interaction QA.

## Unresolved questions

None. The accepted direction and current document constraints are sufficient to implement without product-level clarification.
