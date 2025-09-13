CREATE TABLE "ai_agent_data" (
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
CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"visitor_id" varchar NOT NULL,
	"visitor_ip" varchar(45) DEFAULT '' NOT NULL,
	"asn" varchar(20) DEFAULT '' NOT NULL,
	"as_name" varchar(255) DEFAULT '' NOT NULL,
	"as_domain" varchar(255) DEFAULT '' NOT NULL,
	"country_code" varchar(2) DEFAULT '' NOT NULL,
	"country" varchar(100) DEFAULT '' NOT NULL,
	"continent_code" varchar(2) DEFAULT '' NOT NULL,
	"continent" varchar(50) DEFAULT '' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"message" text NOT NULL,
	"type" varchar NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"browser" varchar(255) DEFAULT '' NOT NULL,
	"country" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(500) NOT NULL,
	"answer" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"support_email" varchar(255) DEFAULT 'support@example.com' NOT NULL,
	"support_phone" varchar(50) DEFAULT '+1 (555) 123-4567' NOT NULL,
	"live_chat_hours" varchar(255) DEFAULT 'Available 9AM - 6PM EST' NOT NULL,
	"hero_title_line1" varchar(255) DEFAULT 'Lets Start a' NOT NULL,
	"hero_title_line2" varchar(255) DEFAULT 'Conversation' NOT NULL,
	"hero_description" text DEFAULT 'We are here to help you succeed. Whether you have questions, need support, or want to explore how our platform can transform your business, our team is ready to assist.' NOT NULL,
	"form_section_title" varchar(255) DEFAULT 'Send Us a Message' NOT NULL,
	"form_section_description" varchar(500) DEFAULT 'Fill out the form below and we will get back to you within 24 hours' NOT NULL,
	"faq_section_title" varchar(255) DEFAULT 'Frequently Asked Questions' NOT NULL,
	"faq_section_description" varchar(500) DEFAULT 'Quick answers to common questions' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"icon" varchar(10) DEFAULT '*' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
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
	"estimated_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"last_contact_at" timestamp,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"priority" varchar(20) DEFAULT 'low' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"action_url" varchar(255),
	"sender_name" varchar(255),
	"sender_avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"conversation_id" integer NOT NULL,
	"visitor_id" varchar NOT NULL,
	"alert_type" varchar(50) DEFAULT 'potential_sale' NOT NULL,
	"confidence_score" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"product_mentioned" varchar(500) DEFAULT '' NOT NULL,
	"conversation_context" text NOT NULL,
	"visitor_message" text NOT NULL,
	"ai_response" text NOT NULL,
	"estimated_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"question" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"primary_color" varchar(7) DEFAULT '#3b82f6' NOT NULL,
	"header_color" varchar(7) DEFAULT '#1e40af' NOT NULL,
	"background_color" varchar(7) DEFAULT '#ffffff' NOT NULL,
	"text_color" varchar(7) DEFAULT '#374151' NOT NULL,
	"button_size" varchar(20) DEFAULT 'medium' NOT NULL,
	"button_position" varchar(20) DEFAULT 'bottom-right' NOT NULL,
	"border_radius" varchar(20) DEFAULT 'rounded' NOT NULL,
	"welcome_message" text DEFAULT 'Hi! How can we help you today?' NOT NULL,
	"placeholder_text" varchar(255) DEFAULT 'Type your message...' NOT NULL,
	"company_name" varchar(255) DEFAULT 'Support Team' NOT NULL,
	"button_text" varchar(255) DEFAULT 'Chat with us' NOT NULL,
	"show_branding" boolean DEFAULT true NOT NULL,
	"brand_name" varchar(255) DEFAULT 'BirdSeed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboard_stats" ADD COLUMN "total_conversations" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboard_stats" ADD COLUMN "total_ai_responses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "meta_data" ADD COLUMN "copyright" varchar DEFAULT '© 2024 Your Company Name. All rights reserved.' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_limits" ADD COLUMN "max_chat_conversations" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_limits" ADD COLUMN "max_ai_responses" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "number_of_websites" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "number_of_conversations" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "number_of_ai_responses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "name" varchar(255) DEFAULT 'name' NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "is_ai_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_agent_data" ADD CONSTRAINT "ai_agent_data_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_sale_alert_id_sale_alerts_id_fk" FOREIGN KEY ("sale_alert_id") REFERENCES "public"."sale_alerts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_alerts" ADD CONSTRAINT "sale_alerts_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_questions" ADD CONSTRAINT "widget_questions_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_settings" ADD CONSTRAINT "widget_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;