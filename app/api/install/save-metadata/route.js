import { db } from '@/configs/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const data = await request.json();

        // Insert metadata with default values for required fields
        const query = sql`
            INSERT INTO meta_data (
                site_title,
                site_description,
                site_keywords,
                logo_url,
                google_analytics_id,
                address,
                phone,
                email,
                maintenance_mode
            ) VALUES (
                ${data['site-name']},
                ${data['site-description']},
                ${data['site-keywords']},
                '/images/defaultIcon.png',  /* default logo */
                'not-set',                  /* default GA ID */
                'not-set',                  /* default address */
                'not-set',                  /* default phone */
                ${data['admin-email']},
                false                       /* maintenance mode off by default */
            )
            RETURNING *
        `;

        const result = await db.execute(query);

        return NextResponse.json({
            success: true,
            message: 'Metadata saved successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error saving metadata:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to save metadata',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
