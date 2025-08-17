CREATE TABLE IF NOT EXISTS "sale_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"conversation_id" integer NOT NULL,
	"visitor_id" varchar NOT NULL,
	"alert_type" varchar(50) DEFAULT 'potential_sale' NOT NULL,
	"confidence_score" numeric(3,2) DEFAULT '0.00' NOT NULL,
	"product_mentioned" varchar(500) DEFAULT '' NOT NULL,
	"conversation_context" text NOT NULL,
	"visitor_message" text NOT NULL,
	"ai_response" text NOT NULL,
	"estimated_value" numeric(10,2) DEFAULT '0.00' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
