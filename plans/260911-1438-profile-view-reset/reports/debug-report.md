# Profile View Reset - Debug Report

## Executive summary

- **Scope:** Temporary View gate, hook/mutation boundary, private actions, public default.
- **Result:** Current implementation satisfies all four requested correctness gates.
- **Defect observed:** During concurrent edits, the dormant editor briefly had a three-argument `editor.onChange` call for Location; current code is corrected and typecheck confirms the signature.
- **Change:** Added focused gate coverage proving private View renders before builder hooks and without editor/public-action UI. Strengthened public renderer test to require default public actions.

## Evidence

### Gate before hooks

`ProfileBuilder` checks module-level `profileBuilderUiEnabled === false` and returns `PublicProfile` before rendering `ProfileBuilderEditor`. All React hooks, autosave initialization, publish callbacks, Sheets, toolbar, outline, and inspector live inside `ProfileBuilderEditor`, a separate component.

Focused test mocks `useProfileBuilderHistory` and `useProfileBuilderAutosave`, renders `ProfileBuilder`, and proves both hooks have zero calls.

### No autosave/background mutation on mount

The active branch renders only `PublicProfile` with resolved props. No effect, history hook, autosave hook, server action, router hook, timer, event listener, or browser history mutation executes in the active `ProfileBuilder` branch.

The gate test additionally proves draft text renders while builder hooks remain uncalled.

### Private View has no public actions

Private branch passes `showActions={false}`. Static-render test proves absence of:

- `.profile-actions`
- editor wrappers
- `input` and `textarea`
- Publish toolbar text

The private View is not marked preview, so it retains full-page profile presentation without preview/editor chrome.

### Public route default unchanged

`PublicProfile.showActions` defaults to `true`; `/q/[token]` does not override it. Public renderer test now explicitly requires `.profile-actions` with default props while continuing to reject editor-only markup.

### Dormant editor integrity

Initial inspection caught a transient Location callback shaped as `onChange(document, document, key)`, incompatible with the two-argument editor contract. A concurrent owner edit corrected it before this agent's patch applied. Fresh typecheck confirms the dormant editor compiles and remains re-enableable from the single gate.

## Verification

- `npm run typecheck` - passed.
- Focused ESLint on `profile-builder.tsx`, `public-profile.tsx`, and both renderer/gate tests - passed.
- `npm test -- --run src/features/profile/profile-builder-view.test.tsx src/features/profile/public-profile.test.tsx` - 2 files, 4 tests passed after the final assertions.

## Files changed

- `src/features/profile/profile-builder-view.test.tsx`
- `src/features/profile/public-profile.test.tsx`

## Unresolved questions

None in the requested correctness scope. Real-route visual overflow remains the parent visual QA responsibility, not evidence for hook/mutation boundaries.
