ALTER TABLE "qr_codes" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_version_check" CHECK ("qr_codes"."version" > 0);