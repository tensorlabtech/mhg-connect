ALTER TABLE "profiles" ADD COLUMN "profile_label" text;

UPDATE "profiles"
SET "profile_label" = 'Hồ sơ ' || to_char(
  "created_at" AT TIME ZONE 'Asia/Ho_Chi_Minh',
  'DD/MM/YYYY'
)
WHERE "profile_label" IS NULL;
