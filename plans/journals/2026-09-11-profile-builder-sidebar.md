---
title: Profile Builder sidebar
date: 2026-09-11
summary: Đưa toàn bộ chỉnh sửa vào sidebar trái và giữ canvas là Profile View chọn block.
---

# Profile Builder sidebar

## What happened

Profile View sạch được dùng làm baseline, sau đó bổ sung một Builder tối giản theo mô hình canvas và inspector.

## Decision

Desktop dùng một sidebar trái cố định. Sidebar có navigation stack từ danh sách block sang form chi tiết; header giữ Back và trạng thái lưu, footer giữ undo/redo, xem public và Publish. Mobile dùng cùng component trong Sheet trái. Canvas chỉ chọn block, không chứa input hay link có thể điều hướng nhầm.

## Evidence

- Authenticated desktop và 375px browser QA pass cho edit/new/public routes.
- Typecheck pass; 7 test files với 19 tests pass; lint không có error.
- Public QR giữ nguyên Lưu, Gọi, Chia sẻ và contact/social links.
- Code review PASS, không có P0/P1.

## Next steps

Dùng shell này làm khung xương cho các block và khả năng builder nâng cao tiếp theo.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
