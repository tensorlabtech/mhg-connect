# 2026-09-11 — Profile Builder V1

## Outcome

Replaced the flat create/edit profile form with a constrained block Builder that can grow into a professional CV/page builder without exposing arbitrary layout primitives too early.

## Decisions

- One versioned `ProfileDocument` owns Identity, Bio, Contact and Social.
- Identity stays first; optional blocks support visibility and vertical order.
- Builder Canvas and public QR output share the same renderer.
- Draft autosave and published snapshots are separate. Publish is the only operation that changes public QR output.
- Desktop uses Canvas + Inspector with an Outline Sheet; mobile switches between Preview and Edit.
- Undo/redo covers document edits; reset clears history; stale tabs require reload.

## Verification

- Unit: 4 files, 11 tests passed.
- Database integration: 1 file, 7 tests passed against the migrated local demo database.
- Typecheck, lint and production build passed; lint retains three pre-existing warnings outside Builder scope.
- Browser QA passed at 1280px and 375px, including create/autosave/publish, public snapshot isolation, reorder/hide, desktop/mobile history controls, and no horizontal overflow.
- Final code review approved with no P0/P1 findings.

## Follow-up

- Make the very first draft create idempotent so a committed insert with a lost response cannot leave a rare duplicate draft.
- Production deploy, real Vercel Blob upload, physical QR scan and Safari/Android rehearsal remain release checks, not local Builder work.
