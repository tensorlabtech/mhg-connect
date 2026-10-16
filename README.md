# MHG Connect

MHG Connect gắn QR định danh trên sản phẩm với hồ sơ số của cá nhân. Mã nguồn nằm trực tiếp tại root để bản demo có thể tiếp tục phát triển thành sản phẩm thật.

## Trạng thái hiện tại

Luồng nền tảng đã được kiểm tra end-to-end với PostgreSQL thật:

`quét QR → đăng ký/đăng nhập → kích hoạt → tạo/lưu hồ sơ → quét lại → admin khóa/mở/reset`.

Trình dựng hồ sơ dùng sidebar full-height bên trái, gộp `Các Block` và `Cài đặt hồ sơ` thành một luồng cuộn: kéo-thả cấu trúc block, chỉnh chi tiết, hoàn tác, đặt tên nội bộ, chọn một trong sáu style pack bằng thumbnail và lưu thủ công. Thư viện nền tách riêng thành modal gồm hiệu ứng CSS, màu, ảnh có sẵn và upload ảnh nền. Canvas bên phải dùng cùng renderer với Profile View, chỉ bổ sung khả năng chọn block; block có thể ẩn bằng nút con mắt, còn field trống tự ẩn. Khi có thay đổi chưa lưu, rời Builder sẽ cần xác nhận.

Thẻ QR là tài sản riêng của từng mã, tách khỏi giao diện hồ sơ. Danh thiếp dùng tỉ lệ vật lý cố định và toàn bộ nội dung co giãn đồng bộ theo kích thước hiển thị. Chủ sở hữu bấm trực tiếp vào chữ, ảnh đại diện, nền hoặc + Logo ngay trên thẻ ở dashboard; chỉ nút Lưu thẻ mới ghi thay đổi. Bộ hiển thị dùng chung cho dashboard, mẫu thẻ, xem trước của admin và bản in. Reset mã sẽ trả thẻ về nền mặc định trước khi chuyển cho chủ sở hữu mới.

### Bổ sung local ngày 2026-10-16

- Ảnh đại diện danh thiếp dùng chung với hồ sơ đang gắn. Bấm ảnh trên thẻ để kéo căn trong vòng tròn hoặc phóng 100–300%; mỗi mẫu lưu khung riêng, không tải một ảnh gốc khác cho thẻ. Nút đổi ảnh đưa về đúng hồ sơ và yêu cầu lưu/hủy thay đổi thẻ trước khi rời. Ảnh ghi đè của các bản thẻ cũ không được dùng làm nguồn; file cũ vẫn giữ nguyên.

- Logo MHG Airpurity dùng ảnh do người dùng cung cấp, bản gốc được giữ nguyên. Bản bỏ nền trắng tại `public/brand/mhg-airpurity-transparent-v1.png`, được dùng ở trang chủ và trên thẻ; không thêm ô nền trắng bằng CSS.
- `/admin/enterprises`: chỉ quản trị MHG được thêm doanh nghiệp, bật/tắt logo riêng, tải logo PNG/JPG/WebP tối đa 2 MB và gán tài khoản nhân sự. Một tài khoản thuộc tối đa một doanh nghiệp nhận diện; tất cả thẻ của tài khoản kế thừa logo doanh nghiệp. Không tự gán theo tên công ty nhập trên hồ sơ. Đây là phạm vi nhận diện thương hiệu, chưa phải mô hình phân quyền multi-tenant đầy đủ.
- Mỗi thẻ chính và mẫu thẻ có vị trí QR trái/phải/trên/dưới, lưu độc lập với hướng dọc/ngang. QR và chữ nằm ở hai vùng riêng. Thẻ ngang nhiều thông tin nên dùng QR trái/phải để chữ lớn hơn.
- Trước khi tải ảnh hoặc bấm nút in, hệ thống kiểm tra tràn/chồng chữ và yêu cầu đổi bố cục hoặc rút gọn nội dung nếu không vừa. Chữ có sẵn trong ảnh nền không được nhận diện tự động; vẫn cần kiểm tra trực quan trước khi in thực tế.
- `/_dev/qr-card-layouts` là trang kiểm thử dùng renderer thật, không chứa hồ sơ khách hàng và không sửa dữ liệu; cùng access policy với các route dev khác.
- Migration bổ sung: `drizzle/0015_enterprise_branding_card_position.sql`. Chỉ đã áp dụng trên PostgreSQL local; chưa deploy hoặc thay đổi dữ liệu production.
- Migration `0016_business_card_inline_appearance.sql` thêm JSON thiết kế riêng cho thẻ chính và mẫu thẻ, không ghi đè hồ sơ hoặc các trường cũ. Chỉ đã áp dụng local.
- Sáu mẫu danh thiếp Kinh điển, Đối xứng, Ngọc trai, Ánh kim, Chân dung, Tinh giản thay cho bộ khung chữ cũ. Bấm chữ để sửa và chọn màu/phông; bấm ảnh để căn khung của cùng ảnh đại diện trong hồ sơ, không tải ảnh riêng cho thẻ. Đổi logo doanh nghiệp cần quyền đã bật trên máy chủ và áp dụng cho toàn bộ nhân sự; logo MHG vẫn cố định.
- Kiểm tra lưu trên PostgreSQL riêng: `src/features/qr/qr-inline-card-actions.integration.test.ts`, chỉ chạy khi `ALLOW_DATABASE_TESTS=true` và tên database local bắt đầu bằng `mhg_cards_qa_`. Không trỏ kiểm thử ghi dữ liệu này vào database sản phẩm. Các kiểm thử không tạo tài khoản đăng nhập thật cho khách hàng.

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

### Danh thiếp 3D và hồ sơ nháp trên máy

- Danh thiếp 3D nằm trong sản phẩm chính: danh sách QR, trình chỉnh thẻ, bản xem trước của quản trị và mục **Xem danh thiếp 3D** trên hồ sơ công khai. Ba bề mặt Hắc kim, Ngọc trai và Ánh kim trên hồ sơ là lựa chọn xem thử, không tự ghi đè mẫu thẻ đã lưu.
- Hiệu ứng nghiêng/ánh sáng chỉ dùng khi xem. Khi xuất PNG hoặc in, thẻ được giữ phẳng; QR vẫn đen trên nền trắng. Thiết bị cảm ứng và chế độ giảm chuyển động không nghiêng thẻ.
- `/drafts/[slug]` chỉ dành cho bản nháp phát triển trên máy: đọc `.local-drafts/[slug]/profile.json` và ảnh từ thư mục `assets` bên cạnh. Không tạo tài khoản, không ghi hồ sơ vào database, không phát hành QR thật. Các nút chọn trong bản nháp không lưu thiết kế vào dữ liệu khách hàng.
- Khi xem dữ liệu cá nhân trong bản nháp, chạy máy chủ chỉ trên địa chỉ nội bộ bằng `npm run dev -- --hostname 127.0.0.1`; không mở cổng này ra mạng hoặc dùng đường hầm chia sẻ. Kiểm tra Host trong mã nguồn không thay thế giới hạn kết nối mạng.
- Thư mục `.local-drafts` được Git bỏ qua và bị loại khỏi danh sách tài nguyên đóng gói của Next.js. Cả trang nháp lẫn API ảnh đều trả 404 khi chạy production, kể cả khi bật `ENABLE_DEV_ROUTES`.

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

### Độ rõ danh thiếp và dòng bảo vệ bắt buộc
- Toàn bộ nội dung thật trên thẻ dùng độ đậm đầy đủ; chỉ ảnh nền có lớp phủ điều chỉnh. Chữ đơn vị, nhãn thương hiệu, liên hệ và dòng bảo vệ được tăng độ đọc. Thẻ đứng yên không giữ phép biến đổi 3D; hiệu ứng nghiêng chỉ chạy khi tương tác.
- “Bảo vệ khỏi virus, vi khuẩn và nấm” là dòng cố định, luôn có trên thẻ và bản xuất. Không có nút sửa/ẩn; thao tác lưu cũ và mới đều ghi nội dung chuẩn, không nhận nội dung thay thế. Logo thẻ dùng bản trong suốt có độ tương phản cao hơn, file logo gốc được giữ nguyên.
- Logo MHG và câu bảo vệ luôn có nền nhỏ tương phản; câu bảo vệ dùng phông Be Vietnam Pro đậm và biểu tượng khiên. Cả hai giữ màu đọc được, độc lập với màu chữ cá nhân và độ rõ ảnh nền.
- Trong trình sửa, từng ô chữ có **Xóa khỏi thẻ** và **Dùng chữ từ hồ sơ**. Ảnh đại diện, ảnh nền và logo bổ sung có thể bỏ khỏi thẻ; **Xóa nội dung trên thẻ** làm trống toàn bộ phần cá nhân sau bước xác nhận. Không xóa hồ sơ hoặc file gốc, không tự lưu. Có thể **Hủy thay đổi** trước khi lưu.
- Các vị trí trống còn nút thêm lại rõ ràng trong trình sửa; nút và chữ gợi ý không xuất hiện trong PNG/in. Logo MHG, câu bảo vệ và QR vẫn còn trên danh thiếp.
- **Tải xuống → Chỉ mã QR** tạo PNG vuông 2048 px, nền trắng, giữ đúng mã và khoảng trắng an toàn của SVG hiện có. Đây là ảnh QR độc lập, không phải một mẫu danh thiếp đã bỏ nhận diện bắt buộc.
