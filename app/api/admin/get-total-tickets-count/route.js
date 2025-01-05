import { getTotalTickets } from '@/utils/AdminUtils';

import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function GET(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        console.log('Unauthorized access attempt');
        return NextResponse.json({ message }, { status });
    }

    try {
        const totalTickets = await getTotalTickets();

        return NextResponse.json({ totalTickets }, { status: 200 }); // Added explicit 200 status
    } catch (error) {
        console.error('Error getting total tickets:', error);
        return NextResponse.json({ message: 'Failed to get total tickets' }, { status: 500 });
    }
}
