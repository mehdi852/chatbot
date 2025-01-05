CREATE TABLE IF NOT EXISTS "collected_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"popup_id" integer NOT NULL,
	"website_id" integer NOT NULL,
	"path_id" integer NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"source_url" varchar,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_websites" integer DEFAULT 0 NOT NULL,
	"total_paths" integer DEFAULT 0 NOT NULL,
	"total_popups" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "footer_company_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "footer_sitemap_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"logo_url" varchar NOT NULL,
	"site_title" varchar NOT NULL,
	"site_description" varchar NOT NULL,
	"site_keywords" varchar NOT NULL,
	"google_analytics_id" varchar NOT NULL,
	"address" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_type_id" integer NOT NULL,
	"max_websites" integer DEFAULT 1 NOT NULL,
	"max_paths_per_website" integer DEFAULT 3 NOT NULL,
	"max_popups_per_path" integer DEFAULT 5 NOT NULL,
	"allow_advertising" boolean DEFAULT false NOT NULL,
	"allow_email_collector" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" boolean NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"yearly_price" numeric(10, 2) NOT NULL,
	"stripe_monthly_link" varchar(255) DEFAULT '' NOT NULL,
	"stripe_yearly_link" varchar(255) DEFAULT '' NOT NULL,
	"stripe_monthly_price_id" varchar(255) DEFAULT '' NOT NULL,
	"stripe_yearly_price_id" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"subscription_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"subject" varchar NOT NULL,
	"body" varchar NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tickets" (
	"ticket_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"name" varchar NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"imageUrl" varchar NOT NULL,
	"role" varchar DEFAULT 'user' NOT NULL,
	"subscription" boolean DEFAULT false NOT NULL,
	"subscription_ends_at" timestamp DEFAULT null,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_type_id" integer NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(20) NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"cancellation_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "visitors_ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar DEFAULT 'No subject' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"body" varchar NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"path" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "website_popups" (
	"id" serial PRIMARY KEY NOT NULL,
	"path_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"type" varchar DEFAULT 'message' NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"icon" varchar NOT NULL,
	"timestamp" varchar NOT NULL,
	"link" varchar,
	"button_text" varchar,
	"placeholder_text" varchar,
	"success_message" varchar,
	"delay" integer DEFAULT 0 NOT NULL,
	"duration" varchar DEFAULT '7000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "websites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"domain" varchar NOT NULL,
	"favicon" varchar NOT NULL,
	"color" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collected_emails" ADD CONSTRAINT "collected_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collected_emails" ADD CONSTRAINT "collected_emails_popup_id_website_popups_id_fk" FOREIGN KEY ("popup_id") REFERENCES "public"."website_popups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collected_emails" ADD CONSTRAINT "collected_emails_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collected_emails" ADD CONSTRAINT "collected_emails_path_id_website_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."website_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription_limits" ADD CONSTRAINT "subscription_limits_subscription_type_id_subscriptions_types_id_fk" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions_features" ADD CONSTRAINT "subscriptions_features_subscription_id_subscriptions_types_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_user_tickets_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."user_tickets"("ticket_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tickets" ADD CONSTRAINT "user_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_subscriptions" ADD CONSTRAINT "users_subscriptions_subscription_type_id_subscriptions_types_id_fk" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."subscriptions_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_paths" ADD CONSTRAINT "website_paths_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "website_popups" ADD CONSTRAINT "website_popups_path_id_website_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."website_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
