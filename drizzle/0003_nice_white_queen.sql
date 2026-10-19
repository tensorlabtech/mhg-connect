CREATE TABLE "qr_claim_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"public_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "visible_fields" SET DEFAULT '{"bio":true,"company":true,"email":true,"linkedIn":true,"location":true,"phone":true,"telegram":true,"title":true,"website":true,"zalo":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "qr_claim_attempts" ADD CONSTRAINT "qr_claim_attempts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qr_claim_attempts_user_token_created_idx" ON "qr_claim_attempts" USING btree ("user_id","public_token","created_at");