---
title: Profile View Reset Test Report
date: 2026-09-11
status: done
scope: plans/260911-1438-profile-view-reset
---

# Summary

Reset passes completed automated and real-route checks. Authenticated edit/new routes render only the finished `PublicProfile` View, without builder chrome, form controls, public actions, or horizontal overflow. `/q/DEMO-ACTIVE` retains public actions.

## Acceptance matrix

| Requirement | Result | Evidence |
|---|---|---|
| `/profiles/[id]/edit` only shows finished profile View | PASS | Authenticated route `/profiles/3f3a341c-6024-46e5-af15-cfdf5ecbc32b/edit` rendered profile content at 1440x900 and 375x812. No builder shell or toolbar visible. |
| `/profiles/new` shows initial profile View | PASS | Real authenticated route rendered profile-only content at desktop and 375px. |
| No builder/form affordances | PASS | Both private routes: 0 `input`, `textarea`, `select`, `.profile-editor-block`, buttons, and `.profile-actions`. |
| Private View hides fake public actions | PASS | Both private routes: 0 `.profile-actions`; no Lưu/Gọi/Chia sẻ controls. |
| Builder hooks do not mount in View state | PASS (source) | `profileBuilderUiEnabled=false` returns `PublicProfile` before `ProfileBuilderEditor`; history/autosave hooks remain inside the unmounted editor component. |
| Existing builder remains behind one boundary | PASS (source) | Builder modules and full `ProfileBuilderEditor` remain present; one gate controls the branch. |
| `/q/DEMO-ACTIVE` keeps public actions | PASS | Real public route at desktop and 375px had one `.profile-actions` group with `Lưu`, `Gọi`, `Chia sẻ`. No editor fields/blocks. |
| No horizontal overflow | PASS | Edit: 1440/1440 and 375/375 `scrollWidth/clientWidth`. New: 1432/1432 and 375/375. Public: 1440/1440 and 375/375. |

## Automated checks

| Check | Result |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| Focused Vitest: public renderer, document, server validation | PASS, 3 files / 10 tests |
| `npm test` | PASS, 6 files / 16 tests, 837ms |
| `npm run lint` | PASS, 0 errors / 3 pre-existing unrelated warnings |

Lint warnings are outside reset scope: one unused parameter in `bao-gia-phase-1`, two `no-img-element` warnings in dev-only UI files.

## Browser notes

- Tested local Next server on port 3000 using authenticated Chrome state.
- Viewports: desktop 1440x900, mobile 375x812.
- No application console errors observed. Chrome-extension/MetaMask warnings were unrelated browser noise.
- No data-editing or public-action control was activated.

## Source snapshot

- `profile-builder.tsx`: `bb488ece747f6d62d46763b7258c207bfec1283a`
- `public-profile.tsx`: `64b95edda477c6eb131ec7543da66669763f9972`
- `public-profile.test.tsx`: `cfdf57eb2346a015ac9c1d8eb5f38cf43b3d00e8`
- `q/[token]/page.tsx`: `82288720972db9c9bf1f6877e8462402dd638a88`

## Findings

No confirmed defects in requested scope.

## Unresolved questions

None.

Status: DONE
Summary: Profile View reset passes focused/full tests, typecheck, lint, authenticated desktop/mobile routes, overflow checks, and public-action regression check.
Concerns/Blockers: None.
