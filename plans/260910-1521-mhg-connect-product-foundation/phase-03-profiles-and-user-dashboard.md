---
phase: 3
title: "Hồ sơ và dashboard người dùng"
status: completed
priority: P1
effort: "1-1.5 ngày"
dependencies: [2]
---

# Phase 3: Hồ sơ và dashboard người dùng

## Overview

Cho chủ QR tạo/chỉnh sửa profile cơ bản, liên kết profile với nhiều QR và hiển thị public profile mobile-first tại chính route QR.

## Requirements

- Profile fields: avatar, tên, chức danh, công ty, bio, phone, email, website, Zalo, social links.
- Hai template đơn giản; bật/tắt field; draft/published.
- Dashboard theo QR: token rút gọn, status, active profile, scan count, actions.
- Empty state cho account chưa có QR.
- Public profile có contact actions, share link và vCard.
- User chỉ sửa profile của chính mình.

## Architecture

- Server Components đọc dữ liệu; Client Components chỉ cho form/preview tương tác.
- Mutation đi qua Server Actions/Route Handlers có session + ownership guard.
- Public `/q/[token]` dùng no-store hoặc revalidation chủ động để edit phản ánh ngay.
- Scan event ghi best-effort; không để lỗi analytics chặn render profile.

## Planned Files

- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/dashboard/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/profiles/new/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/profiles/[id]/edit/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/profile/profile-form.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/profile/public-profile.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/profile/vcard.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/qr/user-qr-list.tsx`

## Implementation Steps

1. Thiết kế mobile public profile trước; giữ form edit phản ánh đúng output.
2. Implement create/edit/publish với Zod validation và ownership checks.
3. Implement avatar upload qua Blob; giới hạn file type/size.
4. Implement chọn active profile khi claim QR thứ hai.
5. Implement dashboard QR-centric và empty state.
6. Implement contact actions, share và `.vcf` download.
7. Ghi scan event cơ bản, tránh lưu raw IP.
8. Kiểm tra profile edit → quét lại thấy dữ liệu mới.

## Todo

- [x] Tạo và publish profile.
- [x] Edit profile chỉ đúng owner.
- [x] Một profile liên kết được hai QR cùng owner.
- [x] QR không được trỏ profile của user khác.
- [x] Public profile không yêu cầu login.
- [x] vCard chứa đúng field được bật.
- [x] 375px không overflow.

## Success Criteria

- Full owner flow chạy từ điện thoại.
- Khách quét QR active thấy profile dưới điều kiện mạng demo bình thường.
- Sửa profile phản ánh ở lần quét tiếp theo.
- User khác không đọc draft hoặc sửa profile.

## Risk Assessment

- Form và public output lệch nhau. Tín hiệu: preview đúng nhưng QR sai. Response: dùng chung normalized profile view model.
- Scan write làm chậm public page. Tín hiệu: latency tăng/lỗi DB làm profile fail. Response: best-effort write, fail-open cho render.
