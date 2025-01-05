import { NextResponse } from 'next/server';
import { getSubscriptionsPerPage } from '@/utils/AdminUtils';
import { checkIfUserIsAdmin } from '@/utils/authUtils';


export async function POST(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    try {
        const { pageNumber, subscriptionsPerPage } = await request.json();
        const subscriptions = await getSubscriptionsPerPage(pageNumber, subscriptionsPerPage);
        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Error in subscriptions-per-page route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
