import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { UsersSubscriptions } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function GET(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const subscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, userId)).limit(1);

        return NextResponse.json({ subscription: subscription[0] || null });
    } catch (error) {
        console.error('Error fetching user subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
