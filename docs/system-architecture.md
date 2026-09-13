# Kiến trúc và vòng đời dữ liệu

## Ranh giới hệ thống

MHG Connect là một Next.js App Router project duy nhất. Server Components đọc dữ liệu; Server Actions và Route Handlers sở hữu mutation/auth; PostgreSQL là source of truth; Vercel Blob giữ ảnh đại diện người dùng tải lên. Ảnh mẫu demo là asset local được allowlist. Không có backend service, queue, Redis hoặc filesystem bền vững riêng.

Các entry point có thể kiểm chứng:

- Schema và invariant: [`src/db/schema`](../src/db/schema).
- Database connection: [`src/db/index.ts`](../src/db/index.ts).
- Auth/session guards: [`src/lib/auth.ts`](../src/lib/auth.ts), [`src/lib/session.ts`](../src/lib/session.ts).
- QR read/claim: [`src/features/qr/qr-data.ts`](../src/features/qr/qr-data.ts), [`src/features/qr/claim-qr.ts`](../src/features/qr/claim-qr.ts).
- Profile builder mutation: [`src/features/profile/profile-builder-actions.ts`](../src/features/profile/profile-builder-actions.ts).
- Profile document contract: [`src/features/profile/profile-document-types.ts`](../src/features/profile/profile-document-types.ts), [`src/features/profile/profile-document-schema.ts`](../src/features/profile/profile-document-schema.ts).
- Admin transition: [`src/features/admin/qr-admin-actions.ts`](../src/features/admin/qr-admin-actions.ts).
- Migration history: [`drizzle`](../drizzle).

## Quan hệ sản phẩm

- Một email xác định một account; một account có thể sở hữu `0..n` QR và `0..n` profile.
- Một QR có tối đa một active profile. Nhiều QR của cùng owner có thể dùng chung một profile.
- QR chỉ được trỏ tới profile cùng owner; database và mutation đều bảo vệ invariant này.
- Reset QR gỡ owner, active profile và thời điểm kích hoạt nhưng không xóa profile cũ.
- Public profile chỉ render khi QR `active` và profile đã được lưu. Khách và chủ sở hữu cùng thấy một trang đọc thuần.

## Lưu hồ sơ

`profiles` giữ hai snapshot JSONB có cùng `ProfileDocument.schemaVersion`:

- `published_document`: hồ sơ được lưu gần nhất; public QR và vCard chỉ đọc snapshot hợp lệ này. Row legacy thiếu/hỏng snapshot được coi là chưa sẵn sàng để tránh lộ draft hoặc cột phẳng mới hơn bản đã phát hành.
- `draft_document`: dữ liệu cũ giữ lại chỉ để tương thích migration, không còn được ghi bởi Builder.

`document_version` tăng sau mỗi lần lưu. Update có điều kiện theo version để tab editor cũ không ghi đè tab mới. Lưu chạy transaction: validate allowlist block, cập nhật snapshot + cột phẳng tương thích, giữ `status=published` như một cờ tương thích kỹ thuật, rồi mới liên kết QR đang chờ. Một QR chỉ có một `activeProfileId`; owner có thể gắn hoặc đổi sang bất kỳ hồ sơ cùng owner đã lưu từ dashboard. Nội dung chưa lưu chỉ tồn tại trong trình duyệt và bị chặn rời trang bằng confirm.

Document v1 có đúng bốn block: Identity bắt buộc/khóa đầu; Bio, Contact và Social có thể ẩn hoặc sắp xếp dọc. Renderer map type qua allowlist; không nhận component, HTML hoặc CSS tuỳ ý từ JSON.

## Vòng đời QR

```text
token không tồn tại ──> invalid view (không phải row trong database)

available / chưa owner
        │ claim atomic bởi user đã login
        ▼
active / đã owner / có thể chưa chọn profile
        │ liên kết profile cùng owner + lưu
        ▼
active / public profile hiển thị
        │                    ▲
        ├─ admin lock ──> locked
        │                    │ admin unlock
        └─ admin reset ──────┴─> available / bỏ liên kết, giữ profile
```

Claim dùng conditional update để chỉ một request thắng. Bộ đếm atomic theo user/phút giới hạn abuse và tự dọn bucket cũ sau 24 giờ. Lock/unlock/reset dùng transition có điều kiện, kiểm tra `version` để từ chối dialog lỗi thời, chạy trong transaction và ghi `admin_actions`. Integration tests cho claim cạnh tranh, rate-limit concurrency, cross-owner constraint, reset-preserves-profile và stale admin version nằm tại [`src/db/product-invariants.integration.test.ts`](../src/db/product-invariants.integration.test.ts).

## Scan và freshness

Route `/q/[token]` là dynamic. Scan event được ghi sau khi response public profile đã được lập lịch, chỉ lưu QR, thời điểm và loại thiết bị suy ra từ user-agent; MVP không lưu raw IP. Dashboard tổng hợp lượt quét từ các event này. Đây là chỉ số vận hành gần đúng, không phải hệ analytics chống gian lận.

## Auth, upload và access policy

- Better Auth quản lý email/password, session và auth tables. Role `admin` chỉ được gán qua seed server-side; không có UI tự nâng quyền.
- Mọi mutation profile kiểm tra session + ownership ở server. Avatar hỗ trợ JPG/PNG/WebP tối đa 2 MB và được lưu public trên Vercel Blob; file mới thất bại transaction được dọn, file cũ được xóa sau replace thành công.
- Avatar/cover preset dùng URL local trong allowlist. Cover upload riêng chưa thuộc demo; lựa chọn cover được lưu ở `profiles.cover_url`.
- `returnTo` từ auth chỉ nhận destination nội bộ cho phép (`/dashboard`, `/admin`, `/q/*`). User thường vào `/admin` được đưa về dashboard với giải thích quyền truy cập.
- Các route `/_dev/*` và `/api/internal/quotation-pdf` mặc định 404 ở production; chỉ mở khi chủ động đặt `ENABLE_DEV_ROUTES=true`.

## Hợp đồng UI

UI sản phẩm dùng component/token đã sở hữu tại [`src/components/ui`](../src/components/ui) và [`src/app/globals.css`](../src/app/globals.css). CSS của hồ sơ công khai thuộc [`src/features/profile/public-profile.css`](../src/features/profile/public-profile.css); public route và Builder Canvas dùng chung registry renderer. Builder desktop là Canvas + contextual Inspector; Outline mở theo nhu cầu. Mobile chuyển giữa Preview/Edit và cung cấp nút Lên/Xuống thay cho việc bắt buộc kéo. Canvas responsive theo chính container để không vỡ khi đặt cạnh inspector. Dark/white/gold, Playfair Display cho display và Be Vietnam Pro cho UI/body là baseline. Whitespace/typography tạo hierarchy; border và card chỉ dùng cho containment hoặc state thật. Mọi thay đổi phải QA route thật trên desktop/mobile theo [AGENTS.md](../AGENTS.md), không suy ra chất lượng visual chỉ từ build.
