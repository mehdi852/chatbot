import { db } from '@/configs/db.server';
import { Websites } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const websites = await db
            .select()
            .from(Websites)
            .where(eq(Websites.user_id, parseInt(userId)));

        return NextResponse.json({ websites });
    } catch (error) {
        console.error('Error fetching websites:', error);
        return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 });
    }
}
