import { db } from '@/configs/db.server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { NewsletterSubscriptions } from '@/configs/schema';
import { desc, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const search = url.searchParams.get('search') || '';

        // Get total count for pagination
        const totalQuery = await db
            .select({ count: sql`count(*)` })
            .from(NewsletterSubscriptions)
            .where(search ? sql`email ILIKE ${`%${search}%`}` : sql`1=1`);

        const total = parseInt(totalQuery[0].count);

        // Get paginated results
        const emails = await db
            .select()
            .from(NewsletterSubscriptions)
            .where(search ? sql`email ILIKE ${`%${search}%`}` : sql`1=1`)
            .orderBy(desc(NewsletterSubscriptions.subscribed_at))
            .limit(limit)
            .offset((page - 1) * limit);

        return NextResponse.json({
            emails,
            total,
            page,
            limit,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
