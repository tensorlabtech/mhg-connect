# Profile Builder V1 - Correctness Investigation

## Executive Summary

- **Issue:** Builder had a publish/autosave race and unsafe post-commit failure handling.
- **Impact:** A publish could conflict with an older queued save; a cache/query failure after commit could report failure and delete the newly published avatar.
- **Root cause:** Autosave skipped a target by comparing only the last completed snapshot, not queued work. Publish used one catch boundary for transaction and post-commit work.
- **Status:** Confirmed issues fixed in owned modules. Optimistic server version guard and draft/published snapshot boundary remain intact.
- **Fix:** Serialize flush behind queued writes, handle rejected saves, separate commit from best-effort post-commit work, clean replaced uploads, validate versions, add destructive history replacement.

## Technical Analysis

### Confirmed findings and fixes

| Priority | Finding                                                                     | Cause evidence                                                                                                                                                                                    | Resolution                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0       | Publish flush could race an in-flight autosave                              | `persist()` returned `true` when target equaled `lastSavedRef`, even while `queueRef` contained a newer write. Sequence `A saved -> save B starts -> UI returns A -> Publish` did not wait for B. | Skip only when queue empty. Otherwise enqueue A behind B; publish receives version after both writes. `beforeunload` also treats queued work as unsaved.                 |
| P0       | Successful publish could be reported failed and its uploaded avatar deleted | Transaction, old-media cleanup, revalidation, and linked-QR query shared one `try/catch`. Any post-commit throw entered rollback cleanup although DB transaction had committed.                   | Transaction catch now owns only pre-commit/transaction failure. Post-commit invalidation/query is best effort and cannot delete committed media or return false failure. |
| P1       | Replacing custom avatar with preset/initials leaked old Blob                | Old avatar deletion required `uploaded` to exist, so preset/null replacements skipped cleanup.                                                                                                    | After commit, compare previous and published avatar URLs and best-effort delete replaced HTTPS asset. Transaction failure still deletes only the new upload.             |
| P1       | Malformed optimistic versions reached SQL                                   | Action trusted `expectedVersion`; `NaN`, fractions, zero for persisted profiles could reach Drizzle/Postgres or create misleading generic errors.                                                 | Shared validator accepts integer `>= 0` for new and integer `>= 1` for existing profile. Focused unit coverage added.                                                    |
| P1       | Discard remained undoable                                                   | Reset used normal history update, retaining discarded draft in `past`.                                                                                                                            | Hook now exposes `replace(document)`, clearing past/future/coalescing state. Builder owner must use it for discard/reset.                                                |

### Invariants reviewed

- Draft autosave for an existing profile updates only `draft_document`, `document_version`, and `updated_at`; it does not update published flat columns, `published_document`, status, or QR linkage.
- Publish atomically updates draft + published snapshots + flat compatibility columns and links a waiting QR in one transaction.
- Existing profile writes require owner ID plus exact `document_version`; a stale tab cannot silently overwrite a newer draft.
- Public QR route passes only `published_document` to the renderer. Invalid/missing published documents fall back to published flat columns.
- Current flat adapter incorporates Contact/Social block visibility, so public Call/vCard compatibility fields do not expose hidden blocks.
- Renderer keeps Identity first and follows stored order for optional blocks; hidden optional blocks render only as editor placeholders.

### Remaining risks

1. **New-profile create retry is not idempotent (P1).** Every save with no `profileId` inserts a new row. If insert commits but the response is lost, retry can create a duplicate before URL identity is known. Recommended: client-generated UUID or persisted idempotency key, with owner-scoped idempotent create semantics.
2. **Blob deletion is best effort (P2).** A failed deletion can leave an orphan. Recommended: durable cleanup queue/periodic reconciliation if upload volume justifies it.
3. **Post-commit cache invalidation is best effort (P2).** Failure is logged and publish returns success, which is truthful for DB state, but stale cached output may persist until normal invalidation/expiry. Recommended: durable invalidation retry when cache policy is introduced.

The controller subsequently added a dedicated `conflict` save state. Its action is “Có bản mới hơn · Tải lại”, so stale tabs no longer present a retry loop as an ordinary network error.

## Verification

- `npm run typecheck` - passed.
- Focused ESLint on owned files and new test - passed.
- `npm test -- --run src/features/profile/profile-builder-server-validation.test.ts src/features/profile/profile-document.test.ts src/features/profile/vcard.test.ts` - 3 files, 8 tests passed.
- `npm test` - 4 files, 11 tests passed.
- Database integration suite not run: requires explicit `ALLOW_DATABASE_TESTS=true` and a migrated disposable database.

## Files changed

- `src/features/profile/profile-builder-actions.ts`
- `src/features/profile/profile-builder-server-validation.ts`
- `src/features/profile/profile-builder-server-validation.test.ts`
- `src/features/profile/use-profile-builder-autosave.ts`
- `src/features/profile/use-profile-builder-history.ts`

## Unresolved Questions

- Should V1 add idempotent create now, or accept rare duplicate drafts until a broader mutation-key contract exists?
- V1 uses reload-only conflict recovery; a future multi-editor workflow may require deliberate rebase/overwrite.
