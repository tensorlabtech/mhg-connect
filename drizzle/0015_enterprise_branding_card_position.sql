CREATE TABLE "enterprise_members" (
	"user_id" text PRIMARY KEY NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enterprises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"custom_logo_enabled" boolean DEFAULT false NOT NULL,
	"logo_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD COLUMN "position" text DEFAULT 'bottom' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "card_position" text DEFAULT 'bottom' NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprise_members" ADD CONSTRAINT "enterprise_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise_members" ADD CONSTRAINT "enterprise_members_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enterprise_members_enterprise_idx" ON "enterprise_members" USING btree ("enterprise_id");--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD CONSTRAINT "qr_card_designs_position_check" CHECK ("qr_card_designs"."position" in ('left', 'right', 'top', 'bottom'));--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_card_position_check" CHECK ("qr_codes"."card_position" in ('left', 'right', 'top', 'bottom'));