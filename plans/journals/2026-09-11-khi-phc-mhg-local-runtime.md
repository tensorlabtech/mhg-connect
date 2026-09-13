---
title: Khôi phục MHG local runtime
date: 2026-09-11
summary: Next dev được restart đúng database sau lỗi ECONNREFUSED do thiếu runtime environment.
---

# Khôi phục MHG local runtime

## What happened
Route `/q/DEMO-NEW` gọi đúng query nhưng PostgreSQL client rơi về mặc định `localhost:5432`; database demo thực tế vẫn khỏe ở `127.0.0.1:55432`.

## Decision
Dừng sạch process do phiên này sở hữu và chạy lại một Next dev process với database và Better Auth variables chỉ trong process. Không ghi credential vào source control.

## Verification
Route QR và login trả HTTP 200, activation UI render, session API trả signed-out response hợp lệ, và socket PostgreSQL tới cổng 55432 ở trạng thái established.

## Next steps
Khi restart server local, luôn nạp bộ runtime variables trước khi chạy `npm run dev`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
