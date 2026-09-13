DROP TABLE "qr_claim_attempts";--> statement-breakpoint
CREATE TABLE "qr_claim_rate_limits" (
	"user_id" text NOT NULL,
	"bucket_start" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "qr_claim_rate_limits_user_id_bucket_start_pk" PRIMARY KEY("user_id","bucket_start"),
	CONSTRAINT "qr_claim_rate_limits_attempts_check" CHECK ("qr_claim_rate_limits"."attempts" > 0)
);
--> statement-breakpoint
ALTER TABLE "qr_claim_rate_limits" ADD CONSTRAINT "qr_claim_rate_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qr_claim_rate_limits_bucket_start_idx" ON "qr_claim_rate_limits" USING btree ("bucket_start");
