

// app/api/admin/edit-status-subscription-type/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editSubscriptionType } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id, name, price, yearlyPrice } = await req.json();

        const updatedSubscriptionType = await editSubscriptionType(id, name, price, yearlyPrice);

        return NextResponse.json({ updatedSubscriptionType }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

