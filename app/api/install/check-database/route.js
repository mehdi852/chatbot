import { db } from '@/configs/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Try to perform a simple query that doesn't require existing tables
        const result = await db.execute(sql`SELECT 1`);

        if (result) {
            return NextResponse.json({
                success: true,
                message: 'Database connection successful',
                details: 'Successfully connected to Neon database',
            });
        } else {
            throw new Error('Database connection test failed');
        }
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Database connection failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
