---
title: "MHG Connect product foundation status"
date: 2026-09-10
status: in_progress
---

# MHG Connect Product Foundation — Status

## Tổng quan

| Hạng mục                    | Trạng thái                 | Bằng chứng chính                                                                                                                         |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 — foundation/data   | Complete local             | Next/UI port; migration `0000`–`0005` pass trên database sạch; seed chạy 2 lần, giữ đúng 3 QR/1 profile và không tạo session dư          |
| Phase 2 — auth/claim        | Complete local             | Browser auth callback + claim pass; conditional claim và rate-limit concurrency có integration test                                      |
| Phase 3 — profile/dashboard | Complete local             | Create/publish/edit/rescan/dashboard/vCard pass; ownership và cross-owner DB constraint có kiểm tra                                      |
| Phase 4 — mini admin        | Complete local             | Lock/unlock/reset + audit pass; reset giữ profile; stale admin transition bị version guard chặn                                          |
| Phase 5 — Vercel/demo QA    | In progress, 3/9 checklist | Local technical gates, responsive browser QA và production-mode access policy pass; chưa có production resources/deploy/device rehearsal |

Tiến độ checklist phase: **30/36 (83%)**. Acceptance toàn plan: **8/12**. Con số này đo task đã kiểm chứng, không đồng nghĩa release production.

## Gate mới nhất

| Gate                        | Kết quả                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Clean PostgreSQL migration  | PASS, `0000`–`0005`                                                                                            |
| Seed idempotency            | PASS, chạy 2 lần                                                                                               |
| DB integration              | PASS, 1 file / 5 tests                                                                                         |
| Unit tests                  | PASS, 2 files / 5 tests                                                                                        |
| Typecheck                   | PASS                                                                                                           |
| Lint                        | PASS với 0 error / 3 warning                                                                                   |
| Next production build       | PASS                                                                                                           |
| Production-mode local smoke | PASS: landing/active/locked/invalid/login 200; protected user/admin redirect an toàn; `_dev` và PDF nội bộ 404 |
| Local browser E2E           | PASS theo `full-product-test.md`                                                                               |
| Vercel production E2E       | NOT RUN                                                                                                        |
| Blob upload thật            | NOT RUN                                                                                                        |
| Physical device rehearsal   | NOT RUN                                                                                                        |

## Căn cứ giữ Phase 1–4 complete

- Status `complete` chỉ áp dụng cho implementation và local verification.
- Luồng user/admin đã chạy trên PostgreSQL thật; invariant nguy hiểm có test database lặp lại.
- Bốn acceptance còn mở vẫn đúng: QR deployed trên điện thoại, claim QR thứ hai, chọn profile cho QR thứ hai, preview/production resource mapping.
- Source/client bundle secret check đã pass; checklist Phase 5 vẫn mở vì chưa có ảnh/screenshot bàn giao production để audit.
- Chưa có bằng chứng production nên plan tổng vẫn `in_progress`; Phase 5 không được nâng thành complete.

## Blocker

1. Chưa link Vercel project.
2. Chưa provision/mapping PostgreSQL và Blob cho Preview/Production.
3. Chưa có production HTTPS URL để sinh QR phát hành.
4. Chưa chạy migration/seed/smoke trên production.
5. Chưa rehearsal bằng QR vật lý trên iPhone/Safari và Android/Chrome.

## Next actions

1. Link Vercel, provision PostgreSQL + Blob, cấu hình và kiểm tra production environment.
2. Migrate + seed production có kiểm soát; smoke auth, claim, profile, vCard, avatar và admin lifecycle.
3. Dùng cùng một account claim QR thứ hai; kiểm tra cả reuse profile cũ và tạo profile mới.
4. Sinh ba QR từ domain HTTPS cuối; rehearsal 375/1280 và hai hệ thiết bị thật.
5. Chỉ sau các bước trên mới hoàn tất Phase 5 và hai acceptance deployment.

## Unresolved Questions

- Vercel project/account, production database/Blob và domain cuối chưa được cung cấp.
- Admin credential production cuối chưa được chốt qua kênh riêng.
