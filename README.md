# MHG Connect

MHG Connect gắn QR định danh trên sản phẩm với hồ sơ số của cá nhân. Mã nguồn nằm trực tiếp tại root để bản demo có thể tiếp tục phát triển thành sản phẩm thật.

## Trạng thái hiện tại

Luồng nền tảng đã được kiểm tra end-to-end với PostgreSQL thật:

`quét QR → đăng ký/đăng nhập → kích hoạt → tạo/lưu hồ sơ → quét lại → admin khóa/mở/reset`.

Trình dựng hồ sơ dùng sidebar full-height bên trái, gộp `Các Block` và `Cài đặt hồ sơ` thành một luồng cuộn: kéo-thả cấu trúc block, chỉnh chi tiết, hoàn tác, đặt tên nội bộ, chọn một trong sáu style pack bằng thumbnail và lưu thủ công. Thư viện nền tách riêng thành modal gồm hiệu ứng CSS, màu, ảnh có sẵn và upload ảnh nền. Canvas bên phải dùng cùng renderer với Profile View, chỉ bổ sung khả năng chọn block; block có thể ẩn bằng nút con mắt, còn field trống tự ẩn. Khi có thay đổi chưa lưu, rời Builder sẽ cần xác nhận.

Thẻ QR là tài sản riêng của từng mã, tách khỏi giao diện hồ sơ. Card dùng tỉ lệ vật lý cố định và toàn bộ nội dung co giãn đồng bộ theo kích thước hiển thị. Chủ sở hữu xem, tải xuống và đổi ảnh nền thẻ ngay trong modal tại dashboard; thiết kế này được dùng thống nhất ở dashboard, modal xem QR của admin và bản in. Reset mã sẽ trả thẻ về nền mặc định trước khi chuyển cho chủ sở hữu mới.

Build, typecheck, unit test, migration/seed lặp lại và browser E2E local đã pass. Deployment Vercel, resource Neon/Blob production, QR trỏ production và rehearsal trên thiết bị vật lý chưa được thực hiện vì dự án chưa được nối credentials, resources và domain production. Bằng chứng chi tiết nằm tại [full product test report](./plans/260910-1521-mhg-connect-product-foundation/reports/full-product-test.md).

## Chạy local

Yêu cầu: Node.js/npm và một PostgreSQL database có thể kết nối.

```bash
npm install
```

Export các biến cấu hình riêng vào shell hiện tại. Tối thiểu để migrate, seed và chạy app cần `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL` và `ADMIN_PASSWORD`. `DEMO_USER_EMAIL` và `DEMO_USER_PASSWORD` là một cặp tùy chọn. Không commit credential thật.

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Các quality gate:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Integration test database chỉ chạy khi chủ động cấp một database test đã migrate:

```bash
ALLOW_DATABASE_TESTS=true npm run test:integration
```

Không trỏ command này vào database production.

## Route chính

| Route                  | Quyền truy cập | Mục đích                                         |
| ---------------------- | -------------- | ------------------------------------------------ |
| `/`                    | Public         | Landing và lối vào luồng sản phẩm                |
| `/q/[token]`           | Public         | Resolve QR, kích hoạt hoặc hiển thị hồ sơ        |
| `/login`, `/register`  | Public         | Auth tab email/password, giữ context QR          |
| `/dashboard`           | User           | Quản lý nhiều QR và nhiều hồ sơ                  |
| `/profiles/new`        | User           | Tạo hồ sơ bằng sidebar Builder và nối QR khi lưu |
| `/profiles/[id]/edit`  | Owner          | Chỉnh và lưu hồ sơ bằng sidebar Builder          |
| `/admin`               | Admin          | Tạo thủ công, tìm/lọc và theo dõi QR             |
| `/admin/qr/[id]`       | Admin          | Xem/in, khóa, mở khóa hoặc reset QR              |
| `/admin/qr/[id]/print` | Admin          | Bản in một mã QR                                 |

Public profile luôn đi qua `/q/[token]`; không có public profile URL tách rời.

## UI foundation

- `src/components/ui` và `src/app/globals.css` là source of truth cho component/tokens.
- Ngôn ngữ hình ảnh cố định: near-black `#0a0a0a`, neutral/white, gold `#e5c16b`; tối giản, nhiều whitespace, ít border, không shadow mặc định.
- `/_dev/design-system`, `/_dev/demo-profile`, `/_dev/demo-outsource-quotation` là catalogue/reference nội bộ. Production mặc định trả 404 trừ khi `ENABLE_DEV_ROUTES=true`; PDF báo giá dùng cùng access policy.
- Quy tắc đầy đủ nằm trong [AGENTS.md](./AGENTS.md). Không tự đồng bộ lại từ repository Boiler Plate.

## Tài liệu

- [Kiến trúc và vòng đời dữ liệu](./docs/system-architecture.md)
- [Triển khai Vercel](./docs/deployment-guide.md)
- [Kịch bản demo khách hàng](./docs/demo-runbook.md)
- [Kế hoạch sản phẩm](./plans/260910-1521-mhg-connect-product-foundation/plan.md)
- [Profile Builder V1 và báo cáo QA](./plans/260911-1112-profile-builder-v1/plan.md)
- [Profile Builder document-first minimalism](./plans/260911-1349-profile-builder-minimalism/plan.md)
- [Profile Builder sidebar refinement](./plans/260911-1540-profile-builder-sidebar-refinement/plan.md)
- [Báo cáo port Boiler Plate UI](./plans/260910-1521-mhg-connect-product-foundation/reports/boilerplate-ui-port.md)

## Phạm vi chưa làm

Email verification/password reset, OAuth/OTP, block tuỳ ý/rich text/gallery, revision history UI, free-form page builder, phát hành QR số lượng lớn, multi-tenant, analytics nâng cao, thanh toán và mobile app chưa thuộc MVP này.
