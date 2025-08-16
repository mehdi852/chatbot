import { db } from '@/configs/db.server';
import { NewsletterSubscriptions } from '@/configs/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
export async function POST(request) {
    try {
        // Validate request body
        if (!request.body) {
            return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
        }

        const { email } = await request.json();

        // Validate email
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Check if email already exists
        const existingSubscription = await db.select().from(NewsletterSubscriptions).where(eq(NewsletterSubscriptions.email, email)).limit(1);

        if (existingSubscription.length > 0) {
            return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
        }

        // Insert new subscription
        await db.insert(NewsletterSubscriptions).values({ email });

        return NextResponse.json({ message: 'Email subscribed to newsletter successfully' }, { status: 200 });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
