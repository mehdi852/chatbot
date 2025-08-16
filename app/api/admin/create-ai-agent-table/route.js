import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { sql } from 'drizzle-orm';

export async function POST() {
    try {
        console.log('Creating AI Agent Data table...');
        
        // Create the ai_agent_data table
        await db.execute(sql`
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
        `);

        console.log('AI Agent Data table created successfully');

        // Add foreign key constraint (with error handling for existing constraint)
        try {
            await db.execute(sql`
                ALTER TABLE "ai_agent_data" 
                ADD CONSTRAINT "ai_agent_data_website_id_websites_id_fk" 
                FOREIGN KEY ("website_id") REFERENCES "websites"("id") 
                ON DELETE no action ON UPDATE no action;
            `);
            console.log('Foreign key constraint added successfully');
        } catch (fkError) {
            if (fkError.message.includes('already exists')) {
                console.log('Foreign key constraint already exists, skipping...');
            } else {
                console.warn('Warning: Could not add foreign key constraint:', fkError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'AI Agent Data table created successfully'
        });

    } catch (error) {
        console.error('Error creating AI Agent Data table:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create AI Agent Data table',
            error: error.message
        }, { status: 500 });
    }
}
