# Deployment

Next.js targets Vercel and PostgreSQL. Media uses Backblaze B2 with a legacy Vercel Blob fallback. Configure resources in the deployment environment; credentials do not belong in Git.

## Environment

See [`.env.example`](../.env.example) and [the environment validator](../scripts/validate-deployment-env.ts).

Required production values: `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ characters), `BETTER_AUTH_URL` (public HTTPS URL), `B2_S3_ENDPOINT`, `B2_REGION`, `B2_BUCKET_NAME`, `B2_KEY_ID`, `B2_APPLICATION_KEY`. Optional public base override: `B2_PUBLIC_URL_BASE`.

Keep `ENABLE_DEV_ROUTES=false` and leave `MEDIA_STORAGE` unset in production. Development and Preview use separate database/storage credentials and auth secrets from production. Preview still requires `DATABASE_URL`, a 32+ character `BETTER_AUTH_SECRET` and the B2 variables above. With `VERCEL_ENV=preview`, auth uses `https://` plus Vercel's injected `VERCEL_URL` for each deployment, overriding any fixed `BETTER_AUTH_URL`; leave `BETTER_AUTH_URL` unset in Preview. Enable access to Vercel System Environment Variables so `VERCEL_ENV` and `VERCEL_URL` are available at build and runtime. Review and test login using the generated deployment URL; production continues to require an explicit HTTPS `BETTER_AUTH_URL`.

Preview also trusts its exact injected `VERCEL_BRANCH_URL` (when present) for login from the stable branch alias. Both Preview hostnames must be plain `.vercel.app` deployment hostnames; arbitrary request hosts are never used to configure auth.

## Release

Push branch tính năng và mở pull request để Vercel tạo bản Preview cho review. Khi merge vào `main`, Git integration triển khai lên production. Migration vẫn là bước riêng; kiểm tra và áp dụng trước khi merge code phụ thuộc schema mới.

1. Run tests, typecheck, lint and build.
2. If migrations changed, back up the target database and run `npm run db:migrate` with the intended connection string. Verify the migration ledger before releasing code that depends on the new schema. Do not run `db:seed` during normal releases.
3. Deploy through the connected Git integration or authenticated Vercel CLI linked to the intended project. The `main` branch is intended for production.
4. Verify login, public QR, uploaded media and changed authenticated flows.

Migration and seed do not run in `npm run build`. Git auto-deploy alone does not sequence migrations. Coordinate migration-bearing merges until a dedicated release pipeline exists.

Keep backups outside Git. A database backup does not include binary media in object storage. Rolling back application code does not roll back the database schema.
