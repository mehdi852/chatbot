-- Migration to add IP geolocation fields to chat_conversations table
ALTER TABLE "chat_conversations" ADD COLUMN "visitor_ip" varchar(45) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "asn" varchar(20) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "as_name" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "as_domain" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "country_code" varchar(2) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "country" varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "continent_code" varchar(2) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "continent" varchar(50) DEFAULT '' NOT NULL;
