# Code Review — Profile Builder V1

Date: 2026-09-11  
Scope: Builder document, autosave/publish actions, shared public renderer, profile routes, schema/migration, focused tests and existing QA reports.  
Verdict: **APPROVED with one non-blocking P2 reliability follow-up.** No P0/P1 correctness, security, accessibility, responsive, or contract finding remains in the reviewed scope.

## Spec compliance

PASS with implementation evidence:

- One schema-versioned, server-validated document contains exactly Identity, Bio, Contact and Social; Identity is locked first.
- Builder Canvas and public QR page use the same `PublicProfile` registry renderer.
- Existing flat columns remain the published compatibility seam; hidden Contact/Social blocks suppress flat visibility fields used by Call/vCard.
- Existing-profile autosave only writes `draft_document`, version and timestamp. Publish updates draft, published JSON and flat columns transactionally and conditionally links a waiting owner QR.
- Outline supports pointer/keyboard drag plus explicit move controls; optional blocks can hide; history covers document edits; mobile Preview/Edit modes exist.
- Current toolbar exposes Undo/Redo at mobile widths. The earlier test-report failure referring to `hidden ... sm:flex` is stale relative to the reviewed source.

## Fix-cycle verification

Resolved with current-source evidence:

- **Edit during Publish:** document and pending-file mutations are rejected while publishing, history shortcuts are ignored, toolbar mutations/navigation are disabled, and Inspector controls are inside a disabled fieldset (`profile-builder.tsx:91-117,265-279`; `profile-builder-toolbar.tsx:61-107`).
- **Back after failed flush:** navigation now occurs only after `autosave.flush()` returns true (`profile-builder.tsx:119-124`).
- **Conditional avatar File:** `File | null` is owned by `ProfileBuilder`, survives Inspector remounts, is appended explicitly to publish `FormData`, and is cleared on successful publish/reset/preset selection (`profile-builder.tsx:58,99-104,134-152,160-164`; `profile-media-picker.tsx:22-42,117-126`). Clearing it changes the FileInput key and removes the stale native selection.
- **Simple dirty restoration:** when the document equals the saved snapshot and no write is queued, the save status returns to `saved` (`use-profile-builder-autosave.ts:89-97`).
- **Mobile history:** Undo and Redo remain rendered without a breakpoint-hiding class (`profile-builder-toolbar.tsx:86-107`).

Fresh gates:

- `npm run typecheck` — pass.
- `npm test -- --run src/features/profile/profile-document.test.ts src/features/profile/profile-builder-server-validation.test.ts src/features/profile/vcard.test.ts` — 3 files, 8 tests pass.

Fix cycle 2 closes the earlier successful-write ordering sequence: when A is saved, save B is in flight, and the user Undo returns to A, B's success advances the version and `persistTarget(currentRef.current)` immediately writes A at the new version (`use-profile-builder-autosave.ts:74-84`). The recursion is asynchronous, serialized behind `queueRef`, and stops once the completed target equals the current document; no success-path recursion or version regression was found.

Fix cycle 3 adds `uncertainWriteRef`: both equality fast paths are disabled after a rejected request, a rejected queued predecessor propagates uncertainty into its successor, and only a confirmed action result clears it (`use-profile-builder-autosave.ts:28,39-69,75-92`). Retry/Back now force a server round trip: it either safely persists the visible snapshot or receives a version conflict and keeps the user in the Builder.

Final fix closes native navigation as well: `beforeunload` now treats an uncertain write as unsaved and only takes the safe-return path when there is no queue, no uncertainty, and the current document equals the confirmed snapshot (`use-profile-builder-autosave.ts:116-128`). The targeted lost-response sequence is now covered consistently by Retry, toolbar Back, reload and tab close.

## Non-blocking follow-up

### P2 — New-profile draft creation is not idempotent

Evidence: every `saveProfileDraftAction` call without `profileId` performs an unconditional insert (`profile-builder-actions.ts:84-101`). The client learns the generated ID only from that response (`use-profile-builder-autosave.ts:74-78`). If the insert commits but its response is lost, retrying creates a second visible draft.

Recommended fix: generate a profile UUID or mutation key client-side and use an owner-scoped idempotent insert/upsert. Add a retry-after-commit test.

## Coverage notes

- Existing DB tests prove intended SQL predicates but reproduce them directly rather than invoking Server Actions. They do not exercise the client autosave queue or retry-after-commit path.
- Final visual QA covers 375 px composition, public fallback, reorder/hide and draft/public separation. The mobile Undo/Redo fix was re-observed at 36×36 px with `scrollWidth=375`, and the test report is marked passing.

## Unresolved questions

- Whether rare duplicate drafts from a lost first-create response are accepted for V1 or must be fixed before release remains a product/reliability decision. The P1 autosave ordering defect does not require a product decision.
