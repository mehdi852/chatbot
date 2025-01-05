import { db } from '@/configs/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check if meta_data table exists and has data
        const query = sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'meta_data'
            ) as table_exists;
        `;

        const tableResult = await db.execute(query);
        const tableExists = tableResult.rows?.[0]?.table_exists;

        if (tableExists) {
            // Check if there's data in meta_data table
            const dataQuery = sql`SELECT COUNT(*) as count FROM meta_data`;
            const dataResult = await db.execute(dataQuery);
            const hasData = dataResult.rows?.[0]?.count > 0;

            return NextResponse.json({
                success: true,
                isInstalled: hasData,
                message: hasData ? 'Database is already installed and populated' : 'Database tables exist but no data',
            });
        }

        return NextResponse.json({
            success: true,
            isInstalled: false,
            message: 'Database needs installation',
        });
    } catch (error) {
        console.error('Error checking database status:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to check database status',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
