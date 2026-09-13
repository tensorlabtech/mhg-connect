---
title: "Test report: Profile Builder V1"
date: 2026-09-11
status: passed
scope: "Current local Profile Builder V1"
---

# Test Report — 2026-09-11 — Profile Builder V1

## Summary

Overall: **PASS after retest**. Core draft/publish isolation, block order/visibility, undo/redo, fallback, build, and 375px layout passed. The initial mobile Undo/Redo defect was fixed and verified in the final controller pass.

Runtime: `http://localhost:3000`, authenticated as `user@example.test`, local PostgreSQL-backed demo. Final code gates ran against stable hashes before/after the commands.

## Acceptance Matrix

| Area | Status | Evidence |
|---|---|---|
| Create + autosave | PASS | From `/profiles/new`, changing the name autosaved after about 1.3s and changed the URL to `/profiles/6bf617a2-c513-4496-892a-d7167b8b42f0/edit`; reload/edit route retained the value. |
| Publish | PASS | Publishing the created profile disabled Publish; dashboard listed `QA Current Builder 260911` as `Đã xuất bản`. Existing linked profile publish updated `/q/DEMO-ACTIVE`. |
| Published snapshot survives draft autosave | PASS | On profile `00000000-0000-4000-8000-000000000001`, autosaved name `QA DRAFT 260911-1141` persisted after reopening editor while `/q/DEMO-ACTIVE` still rendered `Nguyễn Minh Anh`. Only Publish changed public output to the QA marker. Fixture was then restored and republished; final QR output again shows `Nguyễn Minh Anh`, `MHG`, Contact, then Social. |
| Outline reorder | PASS | Explicit `Đưa Mạng xã hội lên` changed canvas order from Bio → Contact → Social to Bio → Social → Contact; live announcement said block moved to position 3. Identity had no reorder control. |
| Hide/show optional block | PASS | Turning Social off changed outline to `Đang ẩn`, canvas to an editor-only hidden placeholder, and published QR omitted Social. Restoring visibility and publishing restored the public block. |
| Undo/Redo behavior | PASS | Editing Company enabled Undo; Undo restored the prior value and enabled Redo; Redo reapplied `QA COMPANY`. Autosave queue eventually returned the indicator to `Đã lưu`. |
| Mobile 375px composition | PASS | Builder exposes distinct `Xem trước` / `Chỉnh sửa` modes and a left Outline sheet. Public QR rendered correctly. Measured `innerWidth=375`, `documentElement.clientWidth=375`, `scrollWidth=375`; no console errors/warnings. |
| Mobile Undo/Redo access | PASS after fix | At 375px, both icon actions are present in the accessibility tree as `Hoàn tác (⌘Z)` and `Làm lại (⇧⌘Z)`. Runtime measurement remained `innerWidth=375`, `clientWidth=375`, `scrollWidth=375`. |
| Public renderer fallback | PASS | Unit `falls back when a persisted document is invalid` passed. `PublicProfile` resolves an invalid/missing persisted document through `resolveProfileDocument(...)` and flat profile data. |

## Quality Gates

| Command | Result | Detail |
|---|---|---|
| `npm run typecheck` | PASS | Exit 0. |
| `npm test` | PASS | 4 files, 11 tests, 0 failures; 445ms. |
| `npm run lint` | PASS with warnings | Exit 0; 3 pre-existing warnings outside Profile Builder (unused variable in old diagram; two dev-catalogue `<img>` warnings). |
| `npm run build` | PASS | Next.js 16.3.4 production build compiled, typechecked, collected data, and generated static pages. |
| `ALLOW_DATABASE_TESTS=true DATABASE_URL='postgresql://lethai@127.0.0.1:55432/mhg_connect_dev' npm run test:integration` | PASS | Controller ran the final suite against the migrated local demo database: 1 file, 7 tests. |

## Resolved defect

### PBV1-TEST-01 — Undo/Redo inaccessible on mobile

- Severity: High for V1 acceptance; resolved before handoff.
- Reproduction:
  1. Open any `/profiles/{id}/edit` route at 375px.
  2. Enter Edit mode and change a field.
  3. Inspect the toolbar and Outline.
- Expected: touch-accessible Undo and Redo controls remain available because document history is a V1 feature.
- Resolution: both compact shared `IconButton` controls remain visible at every breakpoint. A 375px browser retest confirmed semantic visibility and no horizontal overflow.

## Test Data and Cleanup

- Restored and republished the seeded `DEMO-ACTIVE` profile to its original public name, company, visibility, and order.
- The two unlinked profiles created by browser QA were removed from the local demo database after exact ID/name verification. Seeded demo profiles remain.

## Recommendations

1. Add repeatable component/browser tests for mobile history controls and the complete create → autosave → publish → reload URL/state sequence.
