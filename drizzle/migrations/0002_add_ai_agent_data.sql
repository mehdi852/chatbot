-- Add AI Agent Data table
CREATE TABLE IF NOT EXISTS "ai_agent_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"business_name" varchar(255) DEFAULT '' NOT NULL,
	"business_type" varchar(255) DEFAULT '' NOT NULL,
	"business_description" text DEFAULT '' NOT NULL,
	"products_services" text DEFAULT '' NOT NULL,
	"target_audience" text DEFAULT '' NOT NULL,
	"business_hours" varchar(500) DEFAULT '' NOT NULL,
	"contact_information" text DEFAULT '' NOT NULL,
	"special_offers" text DEFAULT '' NOT NULL,
	"policies" text DEFAULT '' NOT NULL,
	"inventory_info" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "ai_agent_data" ADD CONSTRAINT "ai_agent_data_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
