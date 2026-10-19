CREATE TABLE "qr_card_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_code_id" uuid NOT NULL,
	"name" text NOT NULL,
	"background_url" text,
	"text_style" text DEFAULT 'shadow' NOT NULL,
	"heading" text,
	"description" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_card_designs_text_style_check" CHECK ("qr_card_designs"."text_style" in ('shadow', 'band', 'dark', 'light'))
);
--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD CONSTRAINT "qr_card_designs_qr_code_id_qr_codes_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qr_card_designs_qr_code_id_idx" ON "qr_card_designs" USING btree ("qr_code_id");