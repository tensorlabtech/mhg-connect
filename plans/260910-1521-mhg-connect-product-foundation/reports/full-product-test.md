---
title: "MHG Connect full product verification"
date: 2026-09-10
scope: "Product foundation phases 1-5"
status: passed_with_concerns
---

# Full Product Test Report

## Summary

Local code, migration metadata, temporary-PostgreSQL lifecycle, and browser flows pass. No blocking product defect reproduced in tested scope. Production Vercel/Neon/Blob, physical QR, and device-matrix acceptance remain outside this local run.

| Surface               | Result             | Evidence                                                                                         |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| TypeScript            | PASS               | `npm run typecheck`, exit 0                                                                      |
| Unit tests            | PASS               | 2 files, 5 tests, 0 failed, 360 ms                                                               |
| Lint                  | PASS WITH WARNINGS | 0 errors, 3 warnings                                                                             |
| Production build      | PASS               | Next.js 16.3.4 compiled, typechecked, generated 10 static pages; all product routes listed       |
| Drizzle metadata      | PASS               | `drizzle-kit check`: `Everything's fine`                                                         |
| Migration + seed      | PASS               | PostgreSQL 15 temp DB; migrate passed; seed passed twice without duplicate seed rows             |
| Browser E2E           | PASS               | register → callback → claim → profile publish/edit → public rescan → dashboard → admin lifecycle |
| Production deployment | NOT TESTED         | No Vercel/Neon/Blob production environment in this run                                           |

## Commands and Results

Final gate run after product hardening:

```text
npm run typecheck
PASS, exit 0

npm test
PASS, 2 test files / 5 tests

npm run lint
PASS, 0 errors / 3 warnings

npm run build
PASS, Next.js production build

DATABASE_URL=postgres://verify:[REDACTED]@127.0.0.1:5432/verify npx drizzle-kit check --config drizzle.config.ts
PASS, migration metadata internally consistent
```

Build route inventory includes `/`, auth, `/q/[token]`, vCard, dashboard, profile create/edit, admin list/detail, three guarded `_dev` routes, and `/api/internal/quotation-pdf`.

## Unit Tests

- `safeReturnTo`: supported internal destinations; external/protocol-relative/admin/prefix-collision/encoded redirect rejection; valid query and fragment preservation.
- `buildVCard`: visible contact output; hidden email omission; vCard escaping for backslash, comma, semicolon, and newline.
- Added two focused test cases in this run. No product source or package configuration changed by testing.
- Coverage percentage not measured; no coverage provider or threshold configured.

## Database and Migration Verification

- Inspected `0000_faithful_karma.sql`, `0001_careful_devos.sql`, and `0002_abnormal_the_call.sql`.
- Schema contains auth tables, profiles, QR codes, scan events, and admin action log.
- Migration chain contains unique auth account identity, QR status/template checks, composite active-profile/owner foreign key, and final QR lifecycle check.
- `0002` tightens lifecycle: available requires no owner/profile/activation timestamp; active or locked requires an owner; owner/profile deletion is restricted.
- Drizzle `check` passes against current snapshots. Earlier schema export matched the migration-owned tables, constraints, foreign keys, and indexes.
- Temporary PostgreSQL 15 at `127.0.0.1:55432`: migration passed, then passed again after `0002` was generated; only expected Drizzle bookkeeping notices appeared. Seed passed twice.
- State after second seed: 3 QR (`DEMO-NEW` available/unowned, `DEMO-ACTIVE` active/owned, `DEMO-LOCKED` locked/owned), 2 users with admin/user roles, exactly 5 seeded scan events.
- This validates local PostgreSQL behavior. It does not validate Neon networking, preview/production resource separation, or Vercel environment mapping.

## Browser Verification

### Public/static smoke

- Desktop 1280px and mobile 375px: landing rendered without horizontal overflow.
- Login/register kept `returnTo=/q/DEMO-NEW`; required input types and password minimum were present.
- Password visibility button updated both password inputs and accessible label.
- `/_dev/design-system`, `/_dev/demo-profile`, and `/_dev/demo-outsource-quotation` returned 200 at 375px with no horizontal overflow.
- Catalogue search `dialog` reduced results to 3; dialog opened correctly at 375px.
- Browser error/warning log: empty.

### DB-backed user flow

1. `/q/DEMO-NEW` opened activation state.
2. Registered `e2e@example.test`; auth callback preserved the QR route.
3. Claimed QR; redirected to `/profiles/new?qr=DEMO-NEW`.
4. Published profile; edit route returned `saved=1`.
5. Rescan rendered public `Lê Minh Demo`, owner edit action, contact rows, and vCard action.
6. Dashboard showed 1 active QR, 1 profile, and recorded scan count.
7. vCard endpoint returned HTTP 200 with download headers and expected body.

### QR state and admin lifecycle

- 375px public checks: active profile, locked state, and invalid-token state all rendered with `scrollWidth === innerWidth`.
- Admin seed login succeeded. Admin list showed 3 QR, 2 active, 1 locked, and scan metrics.
- Active QR detail → confirmation dialog → lock; fresh public scan showed `Hồ sơ đang tạm khóa`.
- Unlock restored the full public Nguyễn Minh Anh profile.
- Reset showed `Chưa kích hoạt`, `Chưa có` owner, and `Chưa liên kết` profile.
- SQL after reset: QR available with null owner/profile; Nguyễn Minh Anh profile remained published.
- Admin action log contained exactly one lock, one unlock, and one reset record for the tested lifecycle.

## Warnings and Gaps

1. Automated regression depth remains small: only 5 pure-function tests. Claim concurrency, ownership guards, seed idempotency, profile mutations, admin transition guards, and DB constraints rely on this manual local E2E run.
2. Lint warnings:
   - `bao-gia-phase-1/diagram/diagram-learning-popovers.js:177`: unused `_`.
   - `src/features/dev/demo-profile/demo-profile-page.tsx:22`: raw `<img>` performance warning.
   - `src/features/dev/design-system/previews/messaging-files-preview.tsx:14`: raw `<img>` performance warning.
3. Build reports experimental `serverActions`; no failure, but deployment should retain a production smoke check after framework upgrades.
4. Current README and phase documents still describe auth/database/business phases as pending. Product code is ahead of those status claims.
5. Avatar upload through Vercel Blob was not exercised because no Blob credential was used.

## Recommendations

1. Add repeatable PostgreSQL integration tests for atomic claim, cross-owner rejection, lifecycle constraints, reset preservation, and unauthorized admin/profile mutations.
2. Add browser automation for the verified happy path and lock/unlock/reset flow; keep manual phone rehearsal as separate acceptance evidence.
3. Run all migrations on a clean database and an upgrade database in CI, including current `0002`.
4. Before customer demo, verify Vercel production with Neon/Blob, physical QR on iPhone Safari and Android Chrome, 375px overflow, and environment isolation.
5. Refresh README/phase statuses only after final controller verification; keep deployment and real-device evidence separate from code readiness.

## Unresolved Questions

- None for local code readiness. Production resource mapping, final deployment URL, and real-device rehearsal remain required release tasks.
