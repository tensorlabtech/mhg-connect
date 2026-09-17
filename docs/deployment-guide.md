# Triển khai Vercel

## Trạng thái

Production hiện chạy tại [mhg-connect.vercel.app](https://mhg-connect.vercel.app) trong Vercel account `lethai2597` (scope `le-thais-projects`). Project đã nối Neon Free tại Singapore (`sin1`), chạy đủ migration, seed admin/QR demo và smoke test server-side ngày 13/09/2026. Media hồ sơ dùng Backblaze B2 qua S3-compatible API; Vercel Blob chỉ còn là fallback cho môi trường cũ.

Source được lưu tại repository private `tensorlabtech/mhg-connect`. Hobby plan không hỗ trợ nối tự động private repository thuộc organization, vì vậy production hiện deploy bằng Vercel CLI từ checkout đã xác thực thay vì auto-deploy theo GitHub push.

Smoke test đã xác nhận landing/login, ba QR demo, vCard, admin authentication/dashboard và Blob upload hoạt động; route nội bộ trả 404 khi `ENABLE_DEV_ROUTES=false`. Device rehearsal Safari/iPhone và Chrome/Android vẫn phải thực hiện trước buổi demo khách hàng.

## Resource cần có

1. Một Vercel project trỏ tới root repository này.
2. Một PostgreSQL database production, dự kiến Neon qua Vercel Marketplace.
3. Một bucket Backblaze B2 public-read và application key read/write giới hạn đúng bucket đó.
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
| `B2_S3_ENDPOINT`, `B2_REGION`                 | Runtime                  | Endpoint HTTPS và region S3-compatible của bucket B2                     |
| `B2_BUCKET_NAME`                              | Runtime                  | Bucket public-read chứa avatar, cover và background hồ sơ                |
| `B2_KEY_ID`, `B2_APPLICATION_KEY`             | Runtime                  | Credential server-only, giới hạn read/write đúng bucket                  |
| `B2_PUBLIC_URL_BASE`                          | Runtime tùy chọn         | Public base URL nếu không dùng dạng `https://<bucket>.<endpoint>`        |
| `BLOB_READ_WRITE_TOKEN`                       | Runtime tùy chọn         | Fallback xóa/đọc media cũ trên Vercel Blob                               |
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
2. Provision database và bucket B2; gán variables đúng Production. Nếu dùng Preview, tạo bucket/key tách biệt.
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
- Avatar và cover upload thật qua B2 hoạt động; URL public tải được khi không đăng nhập.
- Không có horizontal overflow ở 375 px; admin dùng được ở 1280 px.
- `_dev` và PDF nội bộ đúng access policy.
- Test ít nhất Safari/iPhone và Chrome/Android nếu có thiết bị.
- Kiểm tra favicon, Apple touch icon, title/canonical, social preview image, `robots.txt`, `sitemap.xml` và `manifest.webmanifest` trên domain production.

Nếu runtime lỗi dù build pass, kiểm tra lại environment scope, database migration và Vercel logs trước; không reset/seed production mù.
