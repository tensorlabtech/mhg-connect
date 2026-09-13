---
title: "MHG Connect Product Foundation"
description: "MVP demo-first: quét QR, đăng nhập email/password, kích hoạt, dựng hồ sơ, quản lý nhiều mã và vận hành bằng mini admin."
status: in_progress
priority: P1
effort: "3-5 ngày"
issue: ""
branch: ""
tags: [feature, frontend, backend, database, auth]
blockedBy: []
blocks: []
created: 2026-09-10
---

# MHG Connect Product Foundation

## Overview

Xây MVP trực tiếp tại root dự án, đủ để khách tự quét QR thật trên điện thoại và thấy trọn chu kỳ cá nhân. Kiến trúc và dữ liệu không mang tính throwaway: sau buổi demo, nền này tiếp tục được phát triển thành sản phẩm thật. Một Next.js app đảm nhiệm UI, SSR và API trên Vercel; Neon Postgres giữ dữ liệu; Vercel Blob giữ avatar.

Các phase sản phẩm 1-4 đã hoàn tất và được kiểm tra trên PostgreSQL thật. Phase 5 đã hoàn tất phần code/deploy-readiness; còn bước kết nối resource Vercel, deploy production và quét thử bằng thiết bị vật lý.

## Outcome

Trong một buổi demo 7-10 phút, trình diễn được:

`Quét QR mới → đăng ký/đăng nhập → nhận quyền sở hữu → tạo hồ sơ → xuất bản → quét lại thấy hồ sơ → sửa hồ sơ → admin khóa/mở/reset mã`.

## Constraints

- Source ứng dụng nằm trực tiếp tại `/Users/lethai/Desktop/projects/startup/mhg`, không có thư mục app `demo/` riêng.
- Deploy một Next.js project trên Vercel; không dựng backend server riêng.
- Auth dùng email/password. Demo không gửi email xác minh hoặc email quên mật khẩu.
- Admin là một tài khoản seed cố định; bí mật không commit vào source.
- Dữ liệu MVP là dữ liệu thật trong PostgreSQL, không mock ở frontend.
- Public QR route duy nhất: `/q/{publicToken}`.
- Mobile-first. Nghiệm thu bằng quét QR thật, không chỉ test URL trên desktop.

## Non-goals

- Google/Facebook login, OTP Email/Zalo/SMS.
- Page builder kéo-thả hoặc resize kiểu Notion.
- Tạo lô 10.000 QR, export file in, quản lý kho tem.
- Cổng doanh nghiệp, multi-tenant, phân quyền admin nhiều cấp.
- Quảng cáo động, thanh toán, reward, ESG, BI hoặc analytics nâng cao.
- Custom domain, mobile app, đa ngôn ngữ.
- Production hardening đầy đủ như email verification, password reset, audit nâng cao và chống gian lận.

## Product Decisions

| Chủ đề             | Quyết định MVP                                                 |
| ------------------ | -------------------------------------------------------------- |
| Tài khoản          | Một email là một account; email unique                         |
| Số QR/account      | `0..n`, không hard-code giới hạn                               |
| Số profile/account | `0..n`                                                         |
| Active profile     | Một QR có tối đa một active profile                            |
| Dùng chung profile | Nhiều QR cùng chủ có thể trỏ vào cùng profile                  |
| QR chưa claim      | Hiện activation view và login/register                         |
| QR active          | Hiện public profile, khách không cần login                     |
| QR locked          | Hiện trang tạm khóa                                            |
| Admin              | User seed với role `admin`; không có UI tạo/phân quyền admin   |
| Reset QR           | Gỡ owner và active profile khỏi QR; không xóa profile của user |

## Primary User Flows

### Quét QR chưa kích hoạt

1. Mở `/q/{token}`.
2. Chọn đăng nhập hoặc tạo tài khoản.
3. Hệ thống lưu `returnTo` nội bộ để quay lại đúng QR.
4. User xác nhận kích hoạt.
5. Claim QR bằng transaction; chỉ một account thắng nếu có cạnh tranh.
6. Nếu chưa có profile: mở form tạo profile.
7. Nếu đã có profile: chọn dùng profile cũ hoặc tạo mới.
8. Publish và quay về dashboard.

### Đăng nhập trực tiếp

1. Mở `/login` từ landing hoặc link “Quản lý hồ sơ”.
2. Đăng nhập thành công → `/dashboard`.
3. Không có QR → empty state hướng dẫn quét hoặc nhập token.
4. Có QR → danh sách mã, trạng thái, profile liên kết và lượt quét.

### Khách quét QR active

1. Server đọc QR và active profile.
2. Ghi scan event cơ bản.
3. SSR public profile, không yêu cầu login.
4. Nếu session là chủ mã, hiện action “Chỉnh sửa hồ sơ”; người khác không thấy.

### Admin vận hành

1. Đăng nhập bằng tài khoản admin seed.
2. Xem tổng QR, active QR và scan count.
3. Mở chi tiết một QR.
4. Khóa → quét lại thấy trạng thái khóa.
5. Mở khóa → profile hoạt động lại.
6. Reset QR demo → mã quay về trạng thái chưa kích hoạt.

## Route Contract

| Route                 | Access | Purpose                                                             |
| --------------------- | ------ | ------------------------------------------------------------------- |
| `/`                   | Public | Landing ngắn, CTA quét QR hoặc quản lý hồ sơ                        |
| `/q/[token]`          | Public | Resolver + activation view + public profile + locked/invalid states |
| `/login`              | Public | Email/password login, hỗ trợ `returnTo` nội bộ                      |
| `/register`           | Public | Tạo account demo                                                    |
| `/dashboard`          | User   | Danh sách QR và profile của user                                    |
| `/profiles/new`       | User   | Tạo profile                                                         |
| `/profiles/[id]/edit` | Owner  | Chỉnh sửa và publish profile                                        |
| `/admin`              | Admin  | Dashboard và danh sách QR                                           |
| `/admin/qr/[id]`      | Admin  | Chi tiết, lock, unlock, reset                                       |

Không tạo public route `/p/[slug]`; public profile luôn đi qua QR token.

## Architecture

```text
Phone / Browser
      │
      ▼
Next.js App Router on Vercel
  ├─ Server Components: public profile, dashboard, admin
  ├─ Server Actions / Route Handlers: auth, claim, edit, admin actions
  └─ Authorization: user ownership + admin role
      │                    │
      ▼                    ▼
Neon Postgres         Vercel Blob
accounts/QR/profile   avatar images
```

### Proposed stack

- Next.js App Router + TypeScript.
- Tailwind CSS v4 với token đã port từ Boiler Plate.
- Better Auth với email/password và Drizzle adapter; xác nhận API hiện hành trước triển khai.
- Drizzle ORM + Neon serverless Postgres.
- Vercel Blob cho avatar.
- Zod cho validation.
- Thư viện QR nhỏ chỉ để render/download mã demo.

Không dùng NestJS, Redis, queue, Docker hoặc Cloudflare Worker trong demo.

## Data Model

| Entity        | Fields chính                                                                  | Invariant                                        |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `users`       | id, email, password hash/auth fields, role, timestamps                        | Email unique; role `user` hoặc `admin`           |
| `profiles`    | id, ownerId, name, title, company, bio, contacts, avatarUrl, template, status | Chỉ owner được sửa; status draft/published       |
| `qr_codes`    | id, publicToken, status, ownerId, activeProfileId, activatedAt                | Token unique; profile active phải thuộc owner QR |
| `scan_events` | id, qrCodeId, createdAt, deviceType                                           | Không lưu raw IP trong demo                      |
| Auth tables   | session/account/verification fields theo auth library                         | Không tự thiết kế nếu adapter đã quản lý         |

Trạng thái QR: `available`, `active`, `locked`. Token không tồn tại được biểu diễn bằng view `invalid`, không phải row trạng thái.

## Security Baseline

- Hash password bằng primitive do auth library hỗ trợ; không lưu plaintext.
- Admin email/password lấy từ environment khi seed; không commit credential.
- Authorization kiểm tra server-side trên mọi mutation.
- Chỉ chấp nhận `returnTo` là đường dẫn nội bộ allowlist, tránh open redirect.
- Claim QR atomic: update chỉ khi `ownerId IS NULL` và status `available`.
- Rate limit cơ bản cho login/register/claim nếu demo public lâu ngày.
- Avatar giới hạn MIME, dung lượng và quyền upload.
- Reset QR không xóa dữ liệu profile.

## Initial Dataset

Seed tối thiểu:

- Một admin cố định.
- Một user demo tùy chọn.
- `DEMO-NEW`: QR available.
- `DEMO-ACTIVE`: QR active, profile hoàn chỉnh.
- `DEMO-LOCKED`: QR locked.
- Scan events mẫu cho dashboard admin; không giả lập số liệu ngoài phạm vi demo.

## Phases

| #   | Phase                                                                      | Status                                      | Dependency |
| --- | -------------------------------------------------------------------------- | ------------------------------------------- | ---------- |
| 1   | [Nền tảng và mô hình dữ liệu](./phase-01-foundation-and-data-model.md)     | Complete                                    | None       |
| 2   | [Xác thực và kích hoạt QR](./phase-02-authentication-and-qr-activation.md) | Complete                                    | Phase 1    |
| 3   | [Hồ sơ và dashboard người dùng](./phase-03-profiles-and-user-dashboard.md) | Complete                                    | Phase 2    |
| 4   | [Mini admin](./phase-04-minimal-admin-operations.md)                       | Complete                                    | Phase 1-3  |
| 5   | [Deploy Vercel và QA demo](./phase-05-vercel-deployment-and-demo-qa.md)    | In progress — awaiting production resources | Phase 1-4  |

## Acceptance Criteria

- [ ] Điện thoại quét QR deployed mở đúng `/q/{token}`.
- [x] User mới đăng ký email/password, quay lại đúng QR và claim thành công.
- [x] Hai request không thể claim cùng một QR cho hai user.
- [ ] Một user claim được QR thứ hai.
- [ ] QR thứ hai chọn được profile cũ hoặc tạo profile mới.
- [x] User sửa và publish profile; quét lại thấy dữ liệu mới.
- [x] Khách chưa login xem profile và lưu vCard được.
- [x] User không sửa được profile hoặc QR của user khác.
- [x] Admin khóa/mở/reset QR; trạng thái phản ánh khi quét thật.
- [x] Password/admin secret không xuất hiện trong source hoặc client bundle.
- [x] Mobile không overflow tại 375px; desktop admin dùng được tại 1280px.
- [ ] Preview và production deployments kết nối đúng resource/environment tương ứng.

## Dependencies

- Tài khoản Vercel có quyền tạo project, Neon integration và Blob store.
- Tên miền demo hoặc dùng domain `*.vercel.app`.
- Bộ nhận diện/logo/ảnh sản phẩm MHG nếu muốn polish theo thương hiệu.
- Chốt email admin trước bước seed; password truyền riêng qua environment.

## Risks

| Risk                                   | Signal                            | Response                                                     |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| Demo bị abuse do không verify email    | Account/scan tăng bất thường      | Bật rate limit, giới hạn token seed, xóa/reset sau buổi demo |
| Vercel preview dùng nhầm production DB | Preview làm đổi dữ liệu buổi demo | Tách env hoặc chỉ bật production DB cho production branch    |
| Callback/login mất QR ban đầu          | Login xong về dashboard chung     | Test `returnTo` trên iOS/Android trước demo                  |
| Cache giữ profile cũ                   | Sửa xong quét lại chưa đổi        | Public route dùng no-store/revalidation rõ ràng              |
| Admin credential lộ                    | Credential có trong Git/client JS | Seed hash server-side, env secret, xoay password sau demo    |

## Unresolved Questions

- Product branding cuối cùng chưa chốt; dark/white/gold từ Boiler Plate là visual baseline hiện tại.
- Chưa có Vercel project, production PostgreSQL/Blob credentials, production URL và admin credential cuối để hoàn thành phase 5.

<!-- slug: mhg-connect-product-foundation -->
