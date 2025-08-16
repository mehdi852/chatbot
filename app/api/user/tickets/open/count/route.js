export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { UserTickets } from '@/configs/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        revalidatePath('/dashboard/support');
        const openTicketsCount = await db
            .select({ count: sql`count(*)` })
            .from(UserTickets)
            .where(and(eq(UserTickets.user_id, userId), eq(UserTickets.resolved, false)));

        console.log('Open tickets count:', openTicketsCount[0].count);
        return NextResponse.json(
            {
                count: Number(openTicketsCount[0].count),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching open ticket count:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch open ticket count',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
