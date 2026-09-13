---
phase: 1
title: "Nền tảng và mô hình dữ liệu"
status: completed
priority: P1
effort: "0.5-1 ngày"
dependencies: []
---

# Phase 1: Nền tảng và mô hình dữ liệu

## Overview

Nền Next.js nằm trực tiếp tại root, với UI foundation đã port và schema/migration cho account, nhiều QR, nhiều profile, scan events và audit vận hành. Resource production sẽ được kết nối trong phase 5.

## Requirements

- Functional: port design tokens, 62 UI modules và ba route `_dev` từ React UI Boilerplate.
- Functional: giữ profile demo làm visual baseline cho public profile sản phẩm.
- Functional: một account sở hữu `0..n` QR và `0..n` profile.
- Functional: một QR có tối đa một active profile; nhiều QR cùng owner có thể dùng chung profile.
- Functional: seed ba QR theo ba trạng thái và một admin.
- Non-functional: schema migration được quản lý, seed idempotent, không commit secret.

## Architecture

- Một Next.js App Router project, Node.js runtime trên Vercel.
- UI source được port từ Vite sang Next: thay router/entry/config, giữ component và visual contract.
- Neon Postgres là source of truth.
- Drizzle quản lý schema/migration.
- Vercel Blob chỉ chứa avatar; database giữ URL và metadata.
- Không dùng persistent filesystem của Function.

## Planned Files

- Create: `/Users/lethai/Desktop/projects/startup/mhg/package.json`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/%5Fdev/design-system/page.tsx` (URL `/_dev/design-system`)
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/%5Fdev/demo-profile/page.tsx` (URL `/_dev/demo-profile`)
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/%5Fdev/demo-outsource-quotation/page.tsx` (URL `/_dev/demo-outsource-quotation`)
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/components/ui/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/dev/design-system/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/dev/demo-profile/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/dev/outsource-quotation/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/db/schema/...`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/db/index.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/drizzle.config.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/scripts/seed-demo-data.ts`
- Create: environment variable template during implementation, without real values.

## Implementation Steps

1. Scaffold Next.js + TypeScript tại root; giữ nguyên `README.md`, `plans/`, `original-docs/` và `bao-gia-phase-1/`.
2. Port UI modules, tokens, fonts, assets và ba `_dev` page; adapt router/client boundaries cho Next.
3. Merge UI/visual QA rules vào `AGENTS.md` mà không mất authority tài liệu MHG.
4. Cấu hình lint, typecheck và package scripts tối thiểu.
5. Tạo Neon database qua Vercel Marketplace; cấu hình development/preview/production env.
6. Định nghĩa bảng users/auth, profiles, qr_codes, scan_events với foreign key và unique index.
7. Thêm invariant active profile thuộc cùng owner ở service transaction, cộng constraint khả thi ở DB.
8. Tạo migration đầu tiên.
9. Tạo seed idempotent nhận admin credential từ environment và sinh ba QR demo.
10. Cấu hình Blob store và upload policy cơ bản, nếu phase 3 giữ avatar upload.

## Todo

- [x] Ba route `_dev` render đúng trong Next.
- [x] Design-system interactions được browser-check.
- [x] Profile demo được đối chiếu desktop/mobile với source.
- [x] Next.js app chạy local.
- [x] Database connect qua server-only module.
- [x] Migration chạy trên database sạch.
- [x] Seed chạy lại không tạo trùng admin/token.
- [x] Environment template chỉ chứa tên biến, không có giá trị thật.

## Success Criteria

- Schema biểu diễn đúng quan hệ account–QR–profile.
- Có đủ `DEMO-NEW`, `DEMO-ACTIVE`, `DEMO-LOCKED`.
- Không có secret trong Git diff hoặc client bundle.
- Typecheck và migration checks pass.

## Risk Assessment

- Preview và production có thể dùng nhầm DB. Tín hiệu: thao tác preview đổi dữ liệu production. Response: tách env/resource trước khi viết mutation.
- Active profile khác owner. Tín hiệu: query trả profile của account khác. Response: chặn tại service transaction và thêm test invariant.
