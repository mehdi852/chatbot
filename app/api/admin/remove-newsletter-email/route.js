
import { db } from '@/configs/db';
import { NewsletterSubscriptions } from '@/configs/schema';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { eq } from 'drizzle-orm';

// Change from DELETE to GET since the frontend is using fetch without method specified
export async function GET(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    try {
        await db.delete(NewsletterSubscriptions).where(eq(NewsletterSubscriptions.email, email));
        return NextResponse.json({ message: 'Email removed successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to remove email' }, { status: 500 });
    }
}
