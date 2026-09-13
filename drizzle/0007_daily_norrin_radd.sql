ALTER TABLE "profiles" ADD COLUMN "draft_document" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "published_document" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "document_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_document_version_check" CHECK ("profiles"."document_version" > 0);