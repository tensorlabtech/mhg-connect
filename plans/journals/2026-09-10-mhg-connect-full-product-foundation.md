---
title: MHG Connect full product foundation
date: 2026-09-10
summary: "Hoàn tất local product phases 1-4 và deploy-readiness phase 5 với QR lifecycle, auth, profile, admin và database invariants."
---

# MHG Connect full product foundation

## What happened

- Port và giữ nguyên baseline UI dark/white/gold từ Boiler Plate tại root Next.js.
- Hoàn thiện email/password auth, QR resolver/claim, nhiều profile/QR, public profile/vCard, dashboard và mini admin.
- Thêm PostgreSQL schema/migrations 0000-0005, seed idempotent, Blob avatar lifecycle, access gate cho `_dev` và PDF nội bộ.
- Khắc phục các race condition bằng conditional claim, atomic per-user minute rate bucket và QR version CAS cho admin actions.

## Verification

- Typecheck và production build pass.
- Unit test 5/5; PostgreSQL integration test 5/5.
- Clean migration chain 0000-0005 pass; seed hai lần cho kết quả ổn định và không sinh session thừa.
- Production local smoke: public QR states đúng, private routes redirect auth, `_dev` và internal PDF trả 404 khi bị tắt.
- Lint 0 error, còn 3 warning ở source tham chiếu/imported dev.

## Decision

Phases 1-4 complete. Phase 5 chỉ complete phần deploy-readiness; chưa gọi release-ready cho tới khi nối Vercel/PostgreSQL/Blob production, sinh QR theo HTTPS domain và rehearsal iPhone/Android.

## Next steps

Kết nối production resources và credentials qua kênh riêng, migrate/seed, deploy, sinh QR production, rồi chạy demo runbook trên thiết bị thật.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
