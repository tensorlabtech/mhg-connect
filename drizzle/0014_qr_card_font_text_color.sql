ALTER TABLE "qr_card_designs" ADD COLUMN "font" text DEFAULT 'be-vietnam' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD COLUMN "text_color" text;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "card_font" text DEFAULT 'be-vietnam' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "card_text_color" text;--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD CONSTRAINT "qr_card_designs_font_check" CHECK ("qr_card_designs"."font" in ('be-vietnam', 'manrope', 'oswald', 'playfair', 'lora', 'dancing'));--> statement-breakpoint
ALTER TABLE "qr_card_designs" ADD CONSTRAINT "qr_card_designs_text_color_check" CHECK ("qr_card_designs"."text_color" is null or "qr_card_designs"."text_color" ~ '^#[0-9a-f]{6}$');--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_card_font_check" CHECK ("qr_codes"."card_font" in ('be-vietnam', 'manrope', 'oswald', 'playfair', 'lora', 'dancing'));--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_card_text_color_check" CHECK ("qr_codes"."card_text_color" is null or "qr_codes"."card_text_color" ~ '^#[0-9a-f]{6}$');