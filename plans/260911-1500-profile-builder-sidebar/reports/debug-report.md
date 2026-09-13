# Profile Builder Sidebar - Debug Report

## Executive summary

- **Confirmed defects:** Duplicate responsive Sidebar trees; invisible empty block tab stops; outline mutations remained active during publish.
- **Impact:** Mobile Sheet could coexist with a hidden desktop Sidebar/DnD/form tree; keyboard users could focus empty canvas buttons; reorder controls appeared usable while updates were discarded.
- **Status:** Fixed cause-aligned in builder/public-profile surfaces. Public renderer default remains unchanged.

## Findings and fixes

### P0 - Desktop/mobile Sidebar mounted twice

**Cause:** One `ProfileBuilderSidebar` element was rendered inside both the mobile Sheet and desktop `<aside>`. CSS `hidden` only changed presentation; it did not prevent the hidden desktop Sidebar, Inspector controls, or DnD sensors from mounting on mobile. Opening the Sheet created the second live tree.

**Fix:** `useSyncExternalStore` now tracks the `1024px` sidebar breakpoint with a hydration-safe server snapshot. Mobile Sheet and desktop `<aside>` render through mutually exclusive branches. Exactly one Sidebar tree can be mounted after hydration.

### P1 - Selection canvas exposed invisible buttons

**Cause:** Selection mode wrapped every optional block in `role="button"`, while hidden or empty blocks returned `null`. Result: focusable, zero-content buttons for hidden Bio/Contact/Social blocks.

**Fix:** Selection mode now creates wrappers only for blocks with actual public-visible content. Hidden/empty blocks stay editable from Outline, not as invisible canvas tab stops.

### P1 - Outline controls silently ignored during publish

**Cause:** `changeDocument` rejected mutations during publish, but Outline drag handles, move buttons, visibility switches, and selection buttons remained enabled.

**Fix:** Sidebar passes `publishing` into Outline. Sortable behavior and every mutation/selection control disable together, and `handleDragEnd` has a guard.

## Verified requested boundaries

- **One Sidebar:** Responsive branches are mutually exclusive; no right inspector exists.
- **Publish error detail/focus:** Name and contact-email validation map to Identity/Contact; error switches Sidebar to detail, opens mobile Sheet, then double-RAF focuses the visible matching labeled input. Removing duplicate Sidebar trees also removes ambiguous duplicate focus targets.
- **Autosave coalescing:** Stable keys present for `identity.name`, `identity.title`, `identity.company`, `identity.location`, `bio.text`, all Contact fields, and all Social fields. Visibility/order/layout remain discrete history steps.
- **Selection canvas:** `showActions={false}` removes actions; selection forces directory rows to inert `<div>` output; no editor adapter means no input/textarea; selection wrappers prevent link defaults.
- **Hidden blocks:** Omitted from canvas and remain selectable/editable through Outline and the same detail Inspector, including content fields while block visibility is off.
- **DnD/keyboard:** Pointer and Keyboard sensors remain configured; sortable keyboard coordinates and explicit up/down controls remain. Publish-disabled state now reaches all reorder controls.
- **Public route:** Without `selection` or `editor`, renderer returns normal links and actions. No selection filtering applies to public output.

## Verification

- `npm run typecheck` - passed.
- Focused ESLint across builder Sidebar/Inspector/Outline and public renderer files - passed.
- `npm test -- --run src/features/profile/public-profile.test.tsx src/features/profile/profile-document.test.ts` - 2 files, 8 tests passed.
- Added selection-renderer assertion: no anchor/input/textarea; only Identity is focusable when all optional blocks are empty.
- Live `GET /q/DEMO-ACTIVE` returned 40,567-byte HTML with public actions and zero builder selection/input markers.

## Files changed

- `src/features/profile/profile-builder.tsx`
- `src/features/profile/profile-builder-sidebar.tsx`
- `src/features/profile/profile-builder-outline.tsx`
- `src/features/profile/public-profile.tsx`
- `src/features/profile/public-profile.test.tsx`

## Unresolved questions

- Hydrated responsive branching is verified structurally, but authenticated real-browser focus behavior and breakpoint resizing still need the parent visual/E2E pass.
