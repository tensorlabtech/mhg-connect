---
title: Profile Builder Sidebar Test Report
date: 2026-09-11
status: done
scope: plans/260911-1500-profile-builder-sidebar
---

# Summary

Implementation passes current technical gates and requested browser QA. Desktop has one persistent left editing sidebar; 375px uses a compact header and left Sheet. Canvas stays static/selectable while all form controls remain in sidebar. Public profile actions and links remain intact.

## Acceptance matrix

| Requirement | Result | Evidence |
|---|---|---|
| Desktop persistent left sidebar | PASS | Real authenticated edit/new routes showed one fixed 22rem left sidebar and profile canvas on right; no right inspector. |
| Mobile compact header + left Sheet | PASS | Exact 375px responsive width showed Back, profile name, `Chỉnh sửa`; trigger opened left Sheet with shared structure/sidebar content. |
| List → detail state | PASS | Selecting `Danh tính`, `Giới thiệu`, `Liên hệ`, `Mạng xã hội` replaced structure list with matching inspector; `Cấu trúc` returned to list. Verified desktop and mobile Sheet. |
| Canvas selects correct inspector | PASS | Desktop contact canvas block opened `Thông tin liên hệ`; at 375px, tapping contact card opened the Sheet directly on `Thông tin liên hệ`. |
| Canvas has no edit fields | PASS | Canvas accessibility tree contained selection buttons/static content only, with no text field or text area. Focused renderer test also asserts no `<input>`/`<textarea>`. |
| Canvas directory rows inert | PASS | Private canvas contact row exposed text, not `tel:`, `mailto:`, or external links. Focused renderer test covers inert href boundary. |
| Sidebar identity fields | PASS | Labels/placeholders verified: Họ và tên, Chức danh, Công ty, Địa điểm plus media and visibility controls. |
| Sidebar bio fields | PASS | `Nội dung` textarea and useful descriptive placeholder visible, with section visibility control. |
| Sidebar contact fields | PASS | Email (`ten@congty.vn`), Điện thoại (`+84 912 345 678` example), Website (`https://congty.vn`) labels/placeholders visible. |
| Sidebar social fields | PASS | Zalo, LinkedIn, Telegram labels/placeholders visible. |
| Reorder affordances | PASS | AX tree exposed three sortable drag handles plus labelled move-up/move-down buttons and disabled boundary states. No reorder executed to avoid persistent mutation. |
| Undo/redo/save/publish | PASS | Sidebar footer/header exposed save state, labelled undo/redo controls and Publish; current no-change state correctly disabled history controls. |
| Back targets dashboard | PASS | Browser activation of `Về dashboard` navigated from builder to `/dashboard`. |
| Edit and new routes | PASS | `/profiles/3f3a341c-6024-46e5-af15-cfdf5ecbc32b/edit` and `/profiles/new?qr=DEMO-NEW` verified at desktop and exact 375px width. |
| Public `/q` unchanged | PASS | `/q/DEMO-ACTIVE` retained Lưu vCard, Gọi `tel:`, Chia sẻ, phone/email/website and Zalo/LinkedIn/Telegram links at desktop and 375px. No builder controls. |
| Horizontal overflow | PASS | Desktop and 375px screenshots showed canvas, header, Sheet, and public route contained within viewport; no horizontal scrollbar or clipped action observed. |

## Automated checks

Final gates were rerun after the responsive duplicate-mount fix and shared
sidebar `autoComplete="off"` update landed.

| Check | Result |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| `npm test` | PASS, 7 files / 19 tests, 1.05s |
| `npm run lint` | PASS, 0 errors / 3 unrelated warnings |

Lint warnings remain outside this slice: unused parameter in `bao-gia-phase-1`, two `no-img-element` warnings in dev-only UI files.

## Browser notes

- Local Next server: port 3000, authenticated Chrome state.
- Desktop: current Chrome viewport (~1432px content width).
- Mobile: Chrome device emulation, responsive width exactly 375px.
- Only selection, Sheet, navigation, and read-only controls were used. No field value, visibility, block order, draft, or publish state changed.
- Next issue badge was inspected: MetaMask extension connection error, unrelated to app implementation.

## Final source snapshot

- `profile-builder.tsx`: `804149d17e1e60eb34d30e5fdd76560ce3d25baa`
- `profile-builder-sidebar.tsx`: `efafa20273b80c166128d8553d9ab10a47732449`
- `profile-builder-inspector.tsx`: `6a66058d20c846babebc70421007133860f562db`
- `profile-builder-inspector.test.tsx`: `c9fceb2d04a336f9506074f2dd84b528ee7b9d05`
- `profile-builder-inspector-fields.tsx`: `041a054cb5b4b9d1cceda071dfcbce2d8c39076e`
- `profile-builder-view.test.tsx`: `d7122bd0947e0d63bf3cf5e450d56e206c456404`
- `public-profile.tsx`: `fcd2642a76a17435343d87de66b885fe1e65624a`
- `public-profile.css`: `27dea2663774e16373bc5a12b3d8c273896f04df`
- `public-profile.test.tsx`: `864ab19880364b9586dec7702a8af9d40fdbf458`

## Findings

No confirmed product defect in requested scope.

## Recommendations

- Keep the focused canvas-boundary and responsive mount tests in the default suite; both protect the highest-risk regressions in this shell.

## Unresolved questions

None.

Status: DONE
Summary: Sidebar builder passes final typecheck/tests/lint and authenticated desktop/375px interaction QA; public profile behavior remains intact.
Concerns/Blockers: None.
