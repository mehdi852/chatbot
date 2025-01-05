// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getTicketByEmail } from '@/utils/AdminUtils';

export async function POST(req) {
    try {
        const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

        if (!authorized) {
            return NextResponse.json({ message }, { status });
        }

        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const returnedTicket = await getTicketByEmail(email);
        if (!returnedTicket) {
            return NextResponse.json({ message: 'No ticket found for the provided email' }, { status: 404 });
        }

        return NextResponse.json({ returnedTicket }, { status });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
