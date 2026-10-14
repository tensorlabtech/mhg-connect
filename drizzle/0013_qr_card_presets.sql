CREATE TABLE "qr_card_presets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"background_url" text NOT NULL,
	"orientation" text DEFAULT 'portrait' NOT NULL,
	"text_style" text DEFAULT 'dark' NOT NULL,
	"tagline" text DEFAULT 'Bảo vệ khỏi virus, vi khuẩn và nấm' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_card_presets_text_style_check" CHECK ("qr_card_presets"."text_style" in ('shadow', 'band', 'dark', 'light')),
	CONSTRAINT "qr_card_presets_orientation_check" CHECK ("qr_card_presets"."orientation" in ('portrait', 'landscape')),
	CONSTRAINT "qr_card_presets_background_check" CHECK ("qr_card_presets"."background_url" like '/brand/card-backgrounds/%')
);
--> statement-breakpoint
CREATE INDEX "qr_card_presets_active_sort_idx" ON "qr_card_presets" USING btree ("active","sort_order");
--> statement-breakpoint
-- Mẫu sticker ban đầu (dữ liệu, không phải code): sửa, thêm hoặc tắt mẫu bằng cách đổi dòng trong bảng.
INSERT INTO "qr_card_presets" ("id", "name", "category", "background_url", "orientation", "text_style", "sort_order") VALUES
	('dat-nuoc-ha-long-doc', 'Vịnh Hạ Long · dọc', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-ha-long-doc.jpg', 'portrait', 'dark', 10),
	('dat-nuoc-ha-long-ngang', 'Vịnh Hạ Long · ngang', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-ha-long-ngang.jpg', 'landscape', 'band', 11),
	('dat-nuoc-ruong-bac-thang-doc', 'Ruộng bậc thang · dọc', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-ruong-bac-thang-doc.jpg', 'portrait', 'dark', 12),
	('dat-nuoc-sen-doc', 'Hoa sen · dọc', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-sen-doc.jpg', 'portrait', 'dark', 13),
	('dat-nuoc-hoi-an-ngang', 'Phố cổ Hội An · ngang', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-hoi-an-ngang.jpg', 'landscape', 'band', 14),
	('dat-nuoc-ha-noi-ngang', 'Hồ Gươm, Hà Nội · ngang', 'Đất nước', '/brand/card-backgrounds/dat-nuoc-ha-noi-ngang.jpg', 'landscape', 'band', 15),
	('nano-xanh-doc', 'Xanh Nano · dọc', 'Sản phẩm MHG', '/brand/card-backgrounds/nano-xanh-doc.jpg', 'portrait', 'dark', 20),
	('nano-xanh-ngang', 'Xanh Nano · ngang', 'Sản phẩm MHG', '/brand/card-backgrounds/nano-xanh-ngang.jpg', 'landscape', 'dark', 21),
	('san-pham-dan-khang-khuan-doc', 'Miếng dán kháng khuẩn · dọc', 'Sản phẩm MHG', '/brand/card-backgrounds/san-pham-dan-khang-khuan-doc.jpg', 'portrait', 'dark', 22),
	('san-pham-tranh-nano-ngang', 'Tranh Nano Airpurity · ngang', 'Sản phẩm MHG', '/brand/card-backgrounds/san-pham-tranh-nano-ngang.jpg', 'landscape', 'band', 23)
ON CONFLICT ("id") DO NOTHING;
