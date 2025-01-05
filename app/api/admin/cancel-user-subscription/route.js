import { NextResponse } from 'next/server';
import { updateUserSubscriptionStatus } from '@/utils/AdminUtils';
import Stripe from 'stripe';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { userId, subscriptionId } = await request.json();
        
        // Call the function to update the subscription status
        await updateUserSubscriptionStatus(userId, 'cancelled');

      

        return NextResponse.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error in cancel-user-subscription route:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
