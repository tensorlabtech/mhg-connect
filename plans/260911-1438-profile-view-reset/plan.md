---
title: Profile View Reset
status: completed
priority: P1
effort: small
branch: none
tags: [profile, ui, view-state]
created: 2026-09-11
completed: 2026-09-11
---

# Profile View Reset

Superseded as the active editing surface on 2026-09-11 by [Profile Builder Sidebar](../260911-1500-profile-builder-sidebar/plan.md). Its clean View state remains the canvas baseline.

Status: completed
Progress: 100% (7/7 acceptance criteria verified)

## Outcome

Temporarily replace the rejected Profile Builder surface with the real profile renderer in a clean View state, while preserving the existing builder implementation for a later redesign.

## Constraints

- Keep document data, autosave, publish, QR, database, and public-profile contracts intact.
- Reuse `PublicProfile` and the existing dark, white, restrained-gold design language.
- Do not delete or rewrite the current Builder modules; only remove them from the visible route.
- Preserve the public `/q/[token]` experience.

## Non-goals

- No editing controls, inspector, outline, drag-and-drop, device switcher, or builder toolbar.
- No schema, migration, API, authentication, or storage changes.
- No second redesign of the public profile in this slice.

## Implementation

1. Add an explicit temporary view-first gate before any Profile Builder hook mounts.
2. Render the current draft document through `PublicProfile` as a full-page profile, without editor mode.
3. Hide public actions on private View routes so share and vCard never target an edit URL or unpublished QR.
4. Add focused renderer coverage for the optional action state.
5. Verify edit/new/public routes, desktop/mobile overflow, typecheck, tests, and lint.

## Acceptance criteria

- `/profiles/[id]/edit` shows only a finished profile View surface.
- `/profiles/new` shows its initial profile as View without fake QR actions.
- No Builder toolbar, inspector, outline, input, textarea, select, or drag/drop affordance is visible.
- No Builder history/autosave hook mounts and no background mutation occurs in View state.
- Existing Builder code remains present and can be re-enabled from one explicit boundary.
- `/q/[token]` keeps its current public content and actions.
- No horizontal overflow at 375px or desktop width.

## Risks and rollback

- The private View route deliberately has no public actions; navigation remains browser-level during this temporary reset.
- Rollback is one gate change plus the additive renderer prop; no data rollback is needed.

## Completion evidence

| Area | Result | Evidence |
|---|---|---|
| Private edit/new View | Pass | Authenticated desktop and 375px checks in `reports/test-report.md` |
| Builder UI and hooks hidden | Pass | Focused gate test plus source review in `reports/debug-report.md` and `reports/code-review.md` |
| Public QR regression | Pass | `/q/DEMO-ACTIVE` retained actions on desktop/mobile; renderer regression test passed |
| Responsive | Pass | Edit, new, and public routes matched viewport width with no horizontal overflow |
| Quality gates | Pass | Typecheck; 6 test files / 16 tests; lint with 0 errors |
| Review | Pass | Code review reported no findings or blockers |

This small plan has no phase files. The implementation list and seven acceptance criteria are the complete work breakdown; all were reconciled against the three reports above.

## Documentation impact

`README.md` now states that Builder UI is temporarily hidden, private create/edit routes render View state, and public `/q/[token]` behavior remains unchanged. No additional evergreen documentation update is required.

## Unresolved questions

None.
