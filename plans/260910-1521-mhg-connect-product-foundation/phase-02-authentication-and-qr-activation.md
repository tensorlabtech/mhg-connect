---
phase: 2
title: "Xác thực và kích hoạt QR"
status: completed
priority: P1
effort: "0.5-1 ngày"
dependencies: [1]
---

# Phase 2: Xác thực và kích hoạt QR

## Overview

Cho user đăng ký/đăng nhập email-password từ QR hoặc trực tiếp, giữ context QR qua auth, rồi claim mã an toàn.

## Requirements

- Functional: đăng ký email/password và login/logout.
- Functional: login trực tiếp về dashboard; login từ QR quay lại đúng token.
- Functional: account đã login quét QR available có thể claim.
- Functional: account có profile cũ được chọn dùng lại hoặc tạo profile mới.
- Security: password không plaintext; mutation và redirect được kiểm tra server-side.

## Architecture

- Better Auth email/password với Drizzle adapter, hoặc API tương đương đã được xác minh khi code.
- `/q/[token]` server-render state, không dựng resolver service riêng.
- `returnTo` chỉ nhận URL nội bộ thuộc allowlist.
- Claim thực hiện transaction/update có điều kiện `status = available AND owner_id IS NULL`.

## Planned Files

- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/lib/auth.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/login/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/register/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/app/q/[token]/page.tsx`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/qr/claim-qr.ts`
- Create: `/Users/lethai/Desktop/projects/startup/mhg/src/features/auth/safe-return-to.ts`

## Implementation Steps

1. Tích hợp auth library theo tài liệu hiện hành; tạo session server-side.
2. Viết register/login forms với validation và thông báo lỗi không lộ account state quá mức.
3. Bảo vệ dashboard/profile/admin routes bằng server-side guards.
4. Implement allowlist cho `returnTo` và giữ `/q/{token}` qua auth.
5. Implement QR state loader: invalid, available, active, locked.
6. Implement atomic claim và xử lý conflict thân thiện nếu mã vừa bị người khác nhận.
7. Sau claim, route theo số profile hiện có: tạo mới hoặc chọn existing.
8. Thêm rate limit cơ bản nếu deployment public.

## Todo

- [x] Register/login/logout hoạt động.
- [x] Direct login về dashboard.
- [x] QR login quay lại đúng token.
- [x] Claim QR lần đầu thành công.
- [x] Claim QR đã có owner bị từ chối.
- [x] Open redirect bị từ chối.

## Success Criteria

- Không có hai owner cho cùng QR khi gửi request đồng thời.
- Một account claim được QR thứ hai.
- Password/admin secret không xuất hiện phía client.
- Auth flow chạy được trên mobile browser production-like URL.

## Risk Assessment

- Auth callback mất token. Tín hiệu: login từ QR về dashboard chung. Response: integration test và mobile smoke test cho `returnTo`.
- Demo không verify email. Tín hiệu: đăng ký hàng loạt. Response: rate limit, giới hạn token available, reset deployment sau demo; production phải thiết kế lại.
