ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_available_unclaimed_check";--> statement-breakpoint
ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_active_profile_owner_fk";
--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_active_profile_owner_fk" FOREIGN KEY ("active_profile_id","owner_id") REFERENCES "public"."profiles"("id","owner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_lifecycle_check" CHECK ((
        "qr_codes"."status" = 'available'
        and "qr_codes"."owner_id" is null
        and "qr_codes"."active_profile_id" is null
        and "qr_codes"."activated_at" is null
      ) or (
        "qr_codes"."status" in ('active', 'locked')
        and "qr_codes"."owner_id" is not null
      ));