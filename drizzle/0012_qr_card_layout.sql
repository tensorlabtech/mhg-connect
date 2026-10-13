ALTER TABLE "qr_card_designs" ADD COLUMN "orientation" text DEFAULT 'portrait' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD COLUMN "tagline" text DEFAULT 'Bảo vệ khỏi virus, vi khuẩn và nấm' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "card_orientation" text DEFAULT 'portrait' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "card_tagline" text DEFAULT 'Bảo vệ khỏi virus, vi khuẩn và nấm' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD CONSTRAINT "qr_card_designs_orientation_check" CHECK ("qr_card_designs"."orientation" in ('portrait', 'landscape'));--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_card_orientation_check" CHECK ("qr_codes"."card_orientation" in ('portrait', 'landscape'));