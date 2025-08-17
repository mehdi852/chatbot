CREATE TABLE IF NOT EXISTS "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"conversation_id" integer NOT NULL,
	"sale_alert_id" integer,
	"visitor_id" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"company" varchar(255) DEFAULT '' NOT NULL,
	"lead_source" varchar(50) DEFAULT 'chat' NOT NULL,
	"lead_status" varchar(20) DEFAULT 'new' NOT NULL,
	"product_interest" varchar(500) DEFAULT '' NOT NULL,
	"estimated_value" numeric(10,2) DEFAULT '0.00' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"last_contact_at" timestamp,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_sale_alert_id_sale_alerts_id_fk" FOREIGN KEY ("sale_alert_id") REFERENCES "sale_alerts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
