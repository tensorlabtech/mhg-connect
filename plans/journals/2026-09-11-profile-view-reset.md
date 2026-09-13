---
title: Profile View reset
date: 2026-09-11
summary: Ẩn UI Builder bị từ chối và đưa hồ sơ full-page View lên route riêng tư mà không mount autosave.
---

# Profile View reset

## What happened

Profile Builder document-first đã pass kỹ thuật nhưng bị từ chối về hướng UI. Route tạo và chỉnh sửa cần quay về một bề mặt hồ sơ sạch để làm nền cho lần thiết kế Builder tiếp theo.

## Decision

Đặt gate View trước toàn bộ Builder hooks. Route riêng tư render draft bằng `PublicProfile`, không editor, preview chrome hay public actions. Code Builder, schema, autosave và publish được giữ nguyên; `/q/[token]` tiếp tục có các action công khai.

## Evidence

- Authenticated edit/new route pass desktop và 375px, không overflow hay Builder controls.
- Public QR giữ Lưu, Gọi, Chia sẻ.
- Typecheck pass; 16 tests pass; lint không có error.
- Code review PASS, không có P0/P1.

## Next steps

Dùng View surface này làm baseline trước khi thiết kế lại interaction model cho Builder.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
