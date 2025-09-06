ALTER TABLE "subscription_limits" DROP CONSTRAINT "subscription_limits_subscription_type_id_subscriptions_types_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions_features" DROP CONSTRAINT "subscriptions_features_subscription_id_subscriptions_types_id_fk";
--> statement-breakpoint
ALTER TABLE "users_subscriptions" DROP CONSTRAINT "users_subscriptions_subscription_type_id_subscriptions_types_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_ends_at" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription_limits" ADD CONSTRAINT "subscription_limits_subscription_type_id_subscriptions_types_id" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions_features" ADD CONSTRAINT "subscriptions_features_subscription_id_subscriptions_types_id_f" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_subscription_type_id_subscriptions_types_id" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
