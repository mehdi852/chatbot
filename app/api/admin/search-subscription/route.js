import { NextResponse } from 'next/server';
import { searchSubscriptions } from '@/utils/AdminUtils';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function POST(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    try {
        const { search } = await request.json();
        const subscriptions = await searchSubscriptions(search);
        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Error in search-subscription route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
