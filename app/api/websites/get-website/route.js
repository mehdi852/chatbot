import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { Websites } from '@/configs/schema';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const websiteId = searchParams.get('websiteId');

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        const website = await db.select().from(Websites).where(eq(Websites.id, websiteId)).limit(1);

        if (!website || website.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        return NextResponse.json(website[0]);
    } catch (error) {
        console.error('Error getting website:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
