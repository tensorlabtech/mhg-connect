# Deployment

Next.js targets Vercel and PostgreSQL. Media uses Backblaze B2 with a legacy Vercel Blob fallback. Configure resources in the deployment environment; credentials do not belong in Git.

## Environment

See [`.env.example`](../.env.example) and [the environment validator](../scripts/validate-deployment-env.ts).

Required production values: `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ characters), `BETTER_AUTH_URL` (public HTTPS URL), `B2_S3_ENDPOINT`, `B2_REGION`, `B2_BUCKET_NAME`, `B2_KEY_ID`, `B2_APPLICATION_KEY`. Optional public base override: `B2_PUBLIC_URL_BASE`.

Keep `ENABLE_DEV_ROUTES=false` and leave `MEDIA_STORAGE` unset in production. Development and Preview use separate database/storage credentials and auth secrets from production. Preview still requires `DATABASE_URL`, a 32+ character `BETTER_AUTH_SECRET` and the B2 variables above. With `VERCEL_ENV=preview`, auth uses `https://` plus Vercel's injected `VERCEL_URL` for each deployment, overriding any fixed `BETTER_AUTH_URL`; leave `BETTER_AUTH_URL` unset in Preview. Enable access to Vercel System Environment Variables so `VERCEL_ENV` and `VERCEL_URL` are available at build and runtime. Review and test login using the generated deployment URL; production continues to require an explicit HTTPS `BETTER_AUTH_URL`.

Preview also trusts its exact injected `VERCEL_BRANCH_URL` (when present) for login from the stable branch alias. Both Preview hostnames must be plain `.vercel.app` deployment hostnames; arbitrary request hosts are never used to configure auth.

## Release

Người phát triển tạo nhánh từ `main` mới nhất, sửa code, push và mở PR. GitHub Actions chạy kiểm tra và migration trên DB Preview; Vercel đợi xác nhận của đúng commit rồi build và deploy Preview. Khi chủ repository review và merge `main`, quy trình tương tự chạy trên production, với backup mã hoá trước migration. Không cần thao tác DB hoặc Vercel cho mỗi PR.

Nguồn chuẩn: [workflow](../.github/workflows/release.yml), [lệnh quản lý DB](../scripts/release-database.ts), [bước chờ migration](../scripts/build-after-migration.ts) và [cấu hình Vercel](../vercel.json).

1. GitHub Actions chạy test, typecheck, lint và build thông thường, trước khi cấp quyền truy cập DB cho job phát hành.
2. Job DB kiểm tra commit còn là đầu nhánh, lịch sử bắt đầu từ repository đã dọn và ledger khớp chính xác với các file SQL. Sai hash, thiếu migration hoặc DB đã đi trước nhánh đều làm job dừng.
3. Production tạo archive `pg_dump`, kiểm tra bằng `pg_restore`, mã hoá AES-256-GCM và upload **chỉ bản mã hoá cùng checksum** vào Actions artifacts. Upload lỗi thì không chạy migration.
4. Migration chạy trên kết nối Neon không qua pooler, có advisory lock; sau đó kiểm tra lại toàn bộ ledger. Các job dùng chung DB Preview chạy lần lượt; production có hàng đợi riêng.
5. Job ghi xác nhận theo môi trường, nhánh, commit và fingerprint migration trong schema do pipeline quản lý `release_control`. Đây là dữ liệu điều phối, không phải bảng nghiệp vụ trong Drizzle.
6. Vercel dùng `npm run build:deploy`, chờ xác nhận trong thời gian giới hạn, kiểm tra ledger rồi mới chạy build. Trước khi hoàn tất còn kiểm tra lại commit và ledger. Thiếu xác nhận, migration lỗi hoặc build lỗi thì bản deploy mới thất bại, domain đang phục vụ không chuyển sang bản đó.

`npm run build` vẫn dùng cho local và kiểm tra CI; không chạy hoặc chờ migration. Không seed trong quy trình phát hành. Giữ Git integration của Vercel hoạt động; `vercel.json` đặt build command có bước chờ DB, không tạo pipeline deploy thứ hai.

## Cấu hình quản trị một lần

GitHub environment `Production` chỉ cho phép nhánh `main`; `Preview` dùng DB và storage dev riêng. Quyền merge `main` là bước duyệt production. Cả GitHub và Vercel đều phải trỏ vào cùng DB của môi trường tương ứng.

| Nơi lưu | Tên | Mục đích |
| --- | --- | --- |
| GitHub environment secret | `DATABASE_URL` | URL Neon không qua pooler, chỉ của đúng môi trường |
| GitHub environment variable | `DATABASE_EXPECTED_NAME` | Tên DB được kiểm tra trước thao tác |
| GitHub `Production` secret | `BACKUP_ENCRYPTION_KEY` | Khoá 32 byte dạng 64 ký tự hex để mã hoá backup |
| Vercel | Các biến trong phần Environment | Kết nối runtime và xác thực của ứng dụng |

Workflow dùng token GitHub tự cấp cho việc kiểm tra commit và upload artifact. Không cần chuyển token Vercel cá nhân vào GitHub. Người có quyền sửa workflow và merge code được coi là người quản trị tin cậy; xác nhận trong DB dùng để điều phối phát hành, không phải cơ chế ngăn mã độc từ maintainer.

## Backup và phục hồi

Backup được lưu dưới dạng artifact mã hoá trong lần chạy workflow production, giữ 30 ngày. Khi tải về, giữ cả file backup và file `.sha256` đi kèm. Khoá giải mã phải được chủ dự án giữ riêng ngoài Git và ngoài artifact. Không có khoá thì không khôi phục được archive; cần tải bản backup muốn lưu lâu hơn trước khi hết thời gian giữ.

Lệnh `release:db` có các thao tác `check`, `backup`, `migrate`, `ready` và `decrypt`. Để giải mã, cung cấp môi trường, URL DB, commit của backup, khoá và đường dẫn backup qua biến môi trường; đặt `BACKUP_DECRYPTED_PATH` là đường dẫn tuyệt đối ngoài checkout, rồi chạy `npm run release:db -- decrypt`. Lệnh chỉ tạo và kiểm tra archive, không tự restore hay ghi đè DB. Xem guard trong script trước khi thao tác khôi phục bằng `pg_restore`.

Backup DB không chứa file ảnh trong object storage. Rollback ứng dụng không rollback schema. Migration phải tương thích với bản ứng dụng còn đang chạy: ưu tiên thêm cột/bảng và tách việc xoá hoặc đổi dữ liệu sang lần phát hành được kiểm tra riêng. Một migration phá tương thích vẫn có thể ảnh hưởng bản đang phục vụ dù deploy mới chưa thành công.
