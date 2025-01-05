// app/api/admin/edit-status-subscription-type/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { setStatusOfSubscriptionType } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id, status: subscriptionStatus } = await req.json();

        // Convert status to boolean
       

        const updatedSubscriptionType = await setStatusOfSubscriptionType(id, subscriptionStatus);

        return NextResponse.json({ updatedSubscriptionType }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

