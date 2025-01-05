import { NextResponse } from 'next/server';
import { getActiveSubscriptions } from '@/utils/AdminUtils';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function GET(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const totalSubscriptions = await getActiveSubscriptions();

        return NextResponse.json({ totalSubscriptions }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
