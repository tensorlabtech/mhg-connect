---
phase: 4
title: "Mini admin"
status: completed
priority: P1
effort: "0.5-1 ngày"
dependencies: [1, 2, 3]
---

# Phase 4: Mini admin

## Overview

Tạo bề mặt vận hành tối thiểu để MHG thấy vòng đời QR và để người demo reset dữ liệu giữa các buổi.

## Requirements

- Admin là account seed với role `admin`.
- Dashboard: tổng QR, active QR, locked QR, total scans.
- Danh sách QR: token, trạng thái, owner, active profile, scan count.
- Chi tiết QR: lock, unlock, reset.
- Không có UI quản trị admin, batch generation, export hoặc sửa profile user.

## Architecture

- Mọi admin route và action kiểm tra role ở server.
- Client không phải authority dù ẩn nút.
- Reset QR chỉ unlink owner/active profile và đưa status về available; không xóa profile/account.
- Admin action có confirm dialog; reset ghi log server cơ bản nếu dễ, nhưng không mở rộng audit module.

## Planned Files

- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/admin/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/admin/qr/[id]/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/admin/admin-guard.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/admin/qr-admin-actions.ts`

## Implementation Steps

1. Seed admin bằng environment-provided email/password và hash qua auth layer.
2. Viết admin guard dùng lại cho page loader và mutation.
3. Dựng dashboard metrics và QR table responsive.
4. Implement lock/unlock bằng transaction.
5. Implement reset QR không xóa profile.
6. Thêm confirmation và success/error feedback.
7. Test user thường truy cập URL hoặc gọi mutation admin trực tiếp.

## Todo

- [x] Admin seed idempotent.
- [x] User thường nhận 403/redirect phù hợp.
- [x] Lock phản ánh ngay ở public scan.
- [x] Unlock phục hồi active profile.
- [x] Reset đưa QR về activation view.
- [x] Reset không làm mất profile của owner cũ.

## Success Criteria

- Trình diễn được lock → scan locked → unlock → scan active.
- Trình diễn được reset → QR available → account khác claim.
- Không có admin credential trong source, HTML hoặc browser storage ngoài session hợp lệ.

## Risk Assessment

- “Hard-coded admin” biến thành password trong Git. Tín hiệu: secret scan/diff tìm thấy credential. Response: credential chỉ qua env, seed hash vào DB.
- Reset xóa dữ liệu ngoài ý muốn. Tín hiệu: profile biến mất sau reset. Response: transaction chỉ update qr_codes, có test giữ profile.
