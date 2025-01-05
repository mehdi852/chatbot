import { NextResponse } from 'next/server';
import { getTotalSubscriptions } from '@/utils/AdminUtils';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function GET(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    try {
        const totalSubscriptions = await getTotalSubscriptions();
        return NextResponse.json(totalSubscriptions);
    } catch (error) {
        console.error('Error in total-subscriptions route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
