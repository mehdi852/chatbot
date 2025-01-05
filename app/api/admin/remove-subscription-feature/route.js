// app/api/admin/remove-subscription-feature/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { removeSubscriptionFeature } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id } = await req.json();

        await removeSubscriptionFeature(id);

        return NextResponse.json({ message: 'Subscription feature removed successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
