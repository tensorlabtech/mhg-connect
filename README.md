# MHG Connect

Ứng dụng Next.js kết nối mã QR trên sản phẩm với hồ sơ số, danh thiếp và nhận diện doanh nghiệp.

## Chạy local

Cài Node.js 22+ và npm. Dùng PostgreSQL local hoặc database cloud dành riêng cho dev.

```bash
npm ci
cp .env.example .env.local
```

Điền `DATABASE_URL`, `BETTER_AUTH_URL=http://localhost:3000` và `BETTER_AUTH_SECRET` riêng, tối thiểu 32 ký tự. Upload ảnh cần cấu hình B2 hoặc `MEDIA_STORAGE=local` khi chạy development.

Với database dev trống, đặt `ADMIN_EMAIL`, `ADMIN_PASSWORD` rồi chạy:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Mở http://localhost:3000. Seed tạo ba QR minh họa: `/q/DEMO-NEW`, `/q/DEMO-ACTIVE`, `/q/DEMO-LOCKED`. Không chạy seed vào production. `DEMO_USER_EMAIL` và `DEMO_USER_PASSWORD` là cặp tùy chọn. Thông tin liên hệ trong fixture chỉ là dữ liệu minh họa.

## Chức năng

- Đăng ký, đăng nhập; kích hoạt QR; quản lý nhiều QR và hồ sơ.
- Chỉnh trực tiếp hồ sơ, lựa chọn style và lưu chủ động.
- Thiết kế danh thiếp, căn ảnh, xuất PNG và in.
- Quản trị QR và nhận diện doanh nghiệp.
- Public profile và vCard tại `/q/[token]`.

Catalogue nội bộ: `/_dev/design-system`, `/_dev/demo-profile`, `/_dev/qr-card-layouts`. Bật `ENABLE_DEV_ROUTES=true` để xem local; production mặc định ẩn các route này.

## Kiểm tra

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Database integration tests chỉ chạy với database test riêng và `ALLOW_DATABASE_TESTS=true`; đọc guard trong test trước khi chạy.

## Triển khai

Xem [hướng dẫn triển khai](docs/deployment-guide.md) và [kiến trúc](docs/system-architecture.md). Push nhánh và mở PR để kiểm tra Preview; merge `main` để phát hành production. GitHub Actions kiểm tra code, chạy migration trên đúng database và xác nhận cho Vercel tiếp tục build rồi deploy; production lưu backup mã hoá trước migration. Người phát triển không cần chạy migration cloud thủ công. Build local và seed không tự chạy migration.

Source đã được dọn và gộp về lịch sử mới ngay trên repository gốc. Tài liệu khách hàng, báo giá, trao đổi và lịch sử phát triển trước đây được lưu trong bản sao private riêng. Người đã clone trước đợt chuyển đổi có thể giữ thư mục và cấu hình local; cần sao lưu phần việc chưa merge rồi đồng bộ lại với lịch sử mới của `origin/main`. Không merge hoặc push các branch chứa lịch sử cũ vào repository đã dọn.
