---
title: Profile Builder Minimalism Test Report
date: 2026-09-11
status: done_with_concerns
scope: plans/260911-1349-profile-builder-minimalism
---

# Test summary

Desktop editor and public-renderer checks pass on the current source snapshot. Focused automated tests and TypeScript checks pass. A real 375px mobile interaction pass could not be completed because the Chrome automation connection closed; mobile behavior is therefore source-inspected but not runtime-accepted.

## Acceptance matrix

| Area | Result | Evidence |
|---|---|---|
| Direct profile inputs | PASS | Real authenticated edit route rendered native controls for name, title, company, location, bio, phone, email, website, Zalo, LinkedIn, and Telegram. |
| Document-first desktop layout | PASS | At 1440x900, the profile canvas was primary, with a compact right settings pane. Toolbar retained outline, undo/redo, device preview, and publish actions. No permanent gold card outlines observed; selected block used a restrained marker. |
| Desktop horizontal overflow | PASS | Edit/public pages visually fit the viewport. Public route DOM measured `clientWidth=1440` and `scrollWidth=1440`. |
| Mobile 375px toolbar/settings | NOT RUN | Chrome extension lost its native connection before viewport interaction. Source inspection confirms mobile overflow actions and settings/outline sheets, but that is not real-route evidence. |
| Public route unchanged/static | PASS | `/q/DEMO-ACTIVE` rendered the public profile without application header or editor toolbar. DOM: 0 inputs/textareas/selects, 0 `.profile-editor-block`, 0 `[data-selected]`, 0 `header`. |
| Public route has no editor controls | PASS | Real route inspection at 1440x900 plus DOM counts above. |
| Outline/reorder/history/autosave/publish preserved | PASS (focused automation/source) | Current focused suite passed 13 tests across 5 files. Toolbar and builder wiring expose outline, undo/redo, autosave status, publish, and block movement paths. Full manual mutation was outside this read-only pass. |
| Focus/popup visibility | PARTIAL | Desktop direct inputs and selected state were visible. Mobile sheets and their focus behavior were not runtime-verified. |

## Quality gates

| Command | Result |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| `npm test` | PASS, 5 files / 13 tests, 648ms |

Final tested source snapshot identifiers:

- `profile-builder.tsx`: `1f84632e4b982514dfe6b25866123407763004e4`
- `profile-builder-toolbar.tsx`: `943dc012b1241fd0f1e2fe7ab41fa016e7fbc4ec`
- `public-profile.tsx`: `ea06e2a78ebd8721a4185b51ba98b410feedd4a1`
- `profile-builder-inspector.tsx`: `9eca6ca2cc508889d1af09a899fa86940a074c33`
- `profile-builder-inspector-fields.tsx`: `7c2d9d1db49301e6592fc182df000127c1210af8`

## Confirmed defects

None found in completed checks.

## Unresolved questions

- Does the toolbar, settings sheet, outline sheet, focus state, and popup composition remain fully usable with no horizontal overflow at an actual 375px viewport? A fresh browser session is required for acceptance.
- Manual persistence mutations were intentionally not performed during this read-only pass; focused automated coverage is the evidence for autosave, history, outline, and publish wiring.

Status: DONE_WITH_CONCERNS
Summary: Desktop edit and public routes plus focused tests/typecheck pass; no confirmed product defect found.
Concerns/Blockers: Real 375px interaction verification blocked by Chrome automation connection failure, so mobile acceptance remains open.
