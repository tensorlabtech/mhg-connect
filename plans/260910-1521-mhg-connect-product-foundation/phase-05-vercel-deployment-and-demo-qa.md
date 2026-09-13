---
phase: 5
title: "Deploy Vercel và QA demo"
status: in_progress
priority: P1
effort: "0.5 ngày"
dependencies: [1, 2, 3, 4]
---

# Phase 5: Deploy Vercel và QA demo

## Overview

Deploy production demo, chuẩn bị QR vật lý/ảnh và xác minh toàn bộ kịch bản trên thiết bị thật trước khi chia sẻ khách.

## Requirements

- Một Vercel project trỏ vào root dự án.
- Production env có DB, auth secret, Blob token và admin seed inputs đúng.
- Demo không phụ thuộc localhost hoặc callback URL tạm.
- Có ba QR rõ ràng: new, active, locked.
- Có checklist reset trước mỗi buổi demo.

## Architecture

- Vercel deploy Next.js và Functions.
- Neon integration cung cấp PostgreSQL connection.
- Vercel Blob phục vụ avatar.
- Production public route ưu tiên tính đúng và freshness; chưa tối ưu cache phân tán.

## Planned Files

- Create: `/Users/lethai/Desktop/projects/startup/mhg/vercel.json` chỉ khi thực sự cần.
- Create: `/Users/lethai/Desktop/projects/startup/mhg/docs/demo-runbook.md`.
- Create: `/Users/lethai/Desktop/projects/startup/mhg/public/demo-qr/...` hoặc sinh qua script đã kiểm tra.
- Modify: `/Users/lethai/Desktop/projects/startup/mhg/README.md` với verified setup commands sau implementation.

## Implementation Steps

1. Tạo/link Vercel project với root directory của dự án.
2. Provision Neon và Blob; cấu hình env theo môi trường.
3. Chạy migration và seed production demo một lần có kiểm soát.
4. Deploy preview, chạy smoke tests; sau đó deploy production.
5. Tạo ảnh/in ba QR trỏ đúng production domain.
6. Test trên ít nhất một iPhone/Safari và một Android/Chrome nếu có thiết bị.
7. Chạy kịch bản demo đầy đủ, gồm login callback và admin reset.
8. Viết runbook: credential delivery riêng, reset data, fallback links, known limitations.
9. Quyết định rõ phạm vi truy cập `_dev`; gate bằng environment/auth hoặc loại khỏi production public nếu không cần cho buổi demo. Không để PDF báo giá nội bộ public ngoài chủ đích.

## Todo

- [x] Compile, typecheck và lint pass ở local.
- [ ] Migration production pass.
- [ ] QR thật mở đúng production URL.
- [ ] Register/login/claim pass trên mobile.
- [ ] Edit/rescan pass.
- [ ] Lock/unlock/reset pass.
- [x] Local browser không horizontal overflow ở 375px; admin dùng được ở 1280px.
- [ ] Secrets không có trong repo hoặc screenshot bàn giao.
- [x] Production-mode local xác nhận `_dev` routes và PDF nội bộ trả 404 khi không bật quyền truy cập.

## Success Criteria

- Buổi rehearsal 7-10 phút hoàn thành không cần DevTools hoặc thao tác database thủ công.
- Có fallback URL/token nếu camera hoặc QR vật lý gặp sự cố.
- Trạng thái code, deploy và mobile E2E được báo cáo tách biệt.

## Risk Assessment

- Mobile browser giữ session/cache cũ. Tín hiệu: QR state không đổi sau admin action. Response: no-store cho state route, rehearse trên incognito/device sạch.
- Vercel resource/environment sai. Tín hiệu: compile pass nhưng runtime 500 hoặc dữ liệu khác seed. Response: kiểm tra env mapping và production logs trước rehearsal.
