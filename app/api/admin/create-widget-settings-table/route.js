export const dynamic = 'force-dynamic';

import { db } from '@/configs/db.server';
import { sql } from 'drizzle-orm';

export async function POST() {
    try {
        // Create the widget_settings table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS widget_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                primary_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
                header_color VARCHAR(7) NOT NULL DEFAULT '#1e40af',
                background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
                text_color VARCHAR(7) NOT NULL DEFAULT '#374151',
                button_size VARCHAR(20) NOT NULL DEFAULT 'medium',
                button_position VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
                border_radius VARCHAR(20) NOT NULL DEFAULT 'rounded',
                welcome_message TEXT NOT NULL DEFAULT 'Hi! How can we help you today?',
                placeholder_text VARCHAR(255) NOT NULL DEFAULT 'Type your message...',
                company_name VARCHAR(255) NOT NULL DEFAULT 'Support Team',
                button_text VARCHAR(255) NOT NULL DEFAULT 'Chat with us',
                show_branding BOOLEAN NOT NULL DEFAULT true,
                brand_name VARCHAR(255) NOT NULL DEFAULT 'BirdSeed',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        // Create unique constraint on user_id
        await db.execute(sql`
            CREATE UNIQUE INDEX IF NOT EXISTS widget_settings_user_id_unique 
            ON widget_settings (user_id)
        `);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Widget settings table created successfully',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error creating widget settings table:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to create widget settings table',
                details: error.message,
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
