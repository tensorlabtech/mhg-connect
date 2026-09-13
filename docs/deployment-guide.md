# Triển khai Vercel

## Trạng thái

Ứng dụng đã build và chạy end-to-end local. Chưa có deployment Vercel được xác nhận trong workspace này; Neon, Blob, production variables và domain chưa được nối. Không coi các bước dưới đây là đã hoàn thành cho tới khi smoke test production và device rehearsal có bằng chứng.

## Resource cần có

1. Một Vercel project trỏ tới root repository này.
2. Một PostgreSQL database production, dự kiến Neon qua Vercel Marketplace.
3. Một Vercel Blob store.
4. Domain ổn định, có thể dùng domain `*.vercel.app` của project.
5. Admin credential được chuyển qua kênh riêng, không ghi vào repo/tài liệu/screenshot.

Preview và production nên dùng database riêng. Không cho preview mutation dữ liệu của buổi demo production.

## Environment contract

Executable owner là template environment tại root và [`scripts/validate-deployment-env.ts`](../scripts/validate-deployment-env.ts).

| Biến                                          | Phạm vi                  | Ghi chú                                                                  |
| --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`                                | Runtime, migration, seed | PostgreSQL connection string                                             |
| `BETTER_AUTH_SECRET`                          | Runtime                  | Secret server-only, tối thiểu 32 ký tự                                   |
| `BETTER_AUTH_URL`                             | Runtime                  | URL HTTPS chính xác; đồng thời là base URL cho canonical/social metadata |
| `BLOB_READ_WRITE_TOKEN`                       | Runtime                  | Token server-only cho avatar upload                                      |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Seed                     | Admin cố định; name có default                                           |
| `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`       | Seed tùy chọn            | Phải có đủ cả cặp và khác admin email                                    |
| `APP_URL`                                     | Sinh QR                  | Base URL ổn định, không dùng localhost/preview cho QR phát hành          |
| `RELEASE_QR`                                  | Sinh QR                  | Đặt `true` để bắt buộc `APP_URL` dùng HTTPS                              |
| `ENABLE_DEV_ROUTES`                           | Runtime                  | Mặc định `false`; xem access policy bên dưới                             |

Build trên Vercel tự chạy environment validator trước Next build. Có thể kiểm tra chủ động trong một shell đã nạp đủ biến:

```bash
npm run env:check
```

## Trình tự release

1. Tạo/link Vercel project và chọn root directory hiện tại.
2. Provision database và Blob; gán resource/variables đúng Production. Nếu dùng Preview, tạo mapping tách biệt.
3. Đặt `BETTER_AUTH_URL` bằng domain HTTPS ổn định của project và tạo `BETTER_AUTH_SECRET` riêng cho môi trường.
4. Trong một shell an toàn đã nạp production variables, chạy migration trước khi app nhận traffic:

   ```bash
   npm run env:check
   npm run db:migrate
   ```

5. Seed có kiểm soát một lần. Script upsert ba token cố định, refresh version/timestamp khi chạy lại và sẽ từ chối nếu account đã tồn tại nhưng password cấu hình không khớp:

   ```bash
   npm run db:seed
   ```

6. Deploy production. Kiểm tra landing, auth callback, database read/write, public QR, vCard, admin transitions và avatar upload.
7. Sau khi domain cuối cùng hoạt động, sinh QR phát hành:

   ```bash
   APP_URL=https://your-project.vercel.app RELEASE_QR=true npm run qr:generate
   ```

   Output nằm tại `public/demo-qr`. Kiểm tra nội dung QR bằng camera thật trước khi in/chia sẻ; không tái dùng ảnh đã sinh cho localhost hoặc preview URL.

8. Chạy [demo runbook](./demo-runbook.md) trên trình duyệt sạch và thiết bị thật.

Migration và seed không chạy tự động trong build để tránh mutation database ngoài chủ đích.

## Access policy production

Để `ENABLE_DEV_ROUTES=false` cho bản khách hàng. Khi đó ba route `/_dev/*` và PDF báo giá nội bộ trả 404. Chỉ bật tạm khi có chủ đích review catalogue/artifact; tắt và redeploy sau review.

## Smoke checklist

- `/q/DEMO-NEW` hiện activation, auth quay lại đúng token và claim được.
- `/q/DEMO-ACTIVE` hiện hồ sơ đã lưu và tải vCard được.
- `/q/DEMO-LOCKED` hiện trạng thái khóa.
- User không xem/sửa dữ liệu account khác; non-admin không vào được `/admin`.
- Admin lock → public locked; unlock → profile trở lại; reset → available và profile vẫn còn.
- Avatar upload thật qua Blob hoạt động.
- Không có horizontal overflow ở 375 px; admin dùng được ở 1280 px.
- `_dev` và PDF nội bộ đúng access policy.
- Test ít nhất Safari/iPhone và Chrome/Android nếu có thiết bị.
- Kiểm tra favicon, Apple touch icon, title/canonical, social preview image, `robots.txt`, `sitemap.xml` và `manifest.webmanifest` trên domain production.

Nếu runtime lỗi dù build pass, kiểm tra lại environment scope, database migration và Vercel logs trước; không reset/seed production mù.
