import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/configs/db.server';
import { UsersSubscriptions, Users } from '@/configs/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get user's subscription to find their Stripe customer ID
        const userSubscription = await db
            .select()
            .from(UsersSubscriptions)
            .where(eq(UsersSubscriptions.user_id, userId))
            .limit(1);

        if (!userSubscription.length || !userSubscription[0].stripe_customer_id) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const stripeCustomerId = userSubscription[0].stripe_customer_id;

        // Create a customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error) {
        console.error('Error creating portal session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
