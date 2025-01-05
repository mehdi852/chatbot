import { db } from '@/configs/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Try to create and drop a test table to verify permissions
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS _test_permissions (
                id serial PRIMARY KEY,
                test_column varchar(255)
            )
        `);

        // If we get here, we have CREATE permissions
        // Now try to drop the table
        await db.execute(sql`DROP TABLE IF EXISTS _test_permissions`);

        return NextResponse.json({
            success: true,
            message: 'Database permissions verified',
            details: 'Successfully verified CREATE and DROP permissions',
        });
    } catch (error) {
        console.error('Database permissions check error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Database permissions check failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
