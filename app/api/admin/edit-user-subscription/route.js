// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editUserSubscription, getSubscriptionTypeById } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { userId, subscriptionSettings, planId } = await req.json();

        // Fetch the complete plan details
        const plan = await getSubscriptionTypeById(planId);
        if (!plan) {
            return NextResponse.json({ message: 'Invalid plan selected' }, { status: 400 });
        }

        // Update user subscription in your database
        const updatedUser = await editUserSubscription(userId, {
            ...subscriptionSettings,
            stripeSubscriptionId: subscriptionSettings.stripeSubscriptionId || '1111111',
            stripePriceId: plan.stripeMonthlyPriceId || plan.stripeYearlyPriceId,
            planId: plan.id,
        });

        return NextResponse.json({ message: 'User subscription updated successfully', user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error('Error updating user subscription:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
