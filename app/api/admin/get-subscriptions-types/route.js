// app/api/admin/get-subscriptions-types/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getSubscriptionsTypes } from '@/utils/AdminUtils';

export async function GET(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const subscriptions = await getSubscriptionsTypes();
        const formattedSubscriptions = subscriptions.map((sub) => ({
            id: sub.id,
            name: sub.name,
            price: sub.price,
            status: sub.status ? 'active' : 'inactive',
            yearlyPrice: sub.yearlyPrice,
            features: sub.features || [], // Assuming features are in the database or can be fetched
        }));

        return NextResponse.json({ subscriptions: formattedSubscriptions }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
