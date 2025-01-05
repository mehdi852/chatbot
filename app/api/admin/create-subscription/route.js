// app/api/admin/create-subscription/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { createSubscriptionType } from '@/utils/AdminUtils';
import { revalidatePath } from 'next/cache';
export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { name, status: subscriptionStatus, price, yearlyPrice, stripeMonthlyLink, stripeYearlyLink, stripeMonthlyPriceId, stripeYearlyPriceId } = await req.json();

    try {
        const subscription = await createSubscriptionType(
            name,
            subscriptionStatus === 'active' ? true : false,
            price,
            yearlyPrice,
            stripeMonthlyLink,
            stripeYearlyLink,
            stripeMonthlyPriceId,
            stripeYearlyPriceId
        );

        const newSubscription = {
            name: subscription.name,
            price: subscription.price,
            yearlyPrice: subscription.yearlyPrice,
            status: subscription.status ? 'active' : 'inactive',
            stripeMonthlyLink: subscription.stripeMonthlyLink,
            stripeYearlyLink: subscription.stripeYearlyLink,
            stripeMonthlyPriceId: subscription.stripeMonthlyPriceId,
            stripeYearlyPriceId: subscription.stripeYearlyPriceId,
            features: subscription.features || [],
        };

        revalidatePath('/pricing');

        return NextResponse.json({ newSubscription }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
