import { resolveTicket } from '@/utils/AdminUtils';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function POST(req) {
    const { ticket_id } = await req.json();
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
        }

    await resolveTicket(ticket_id);

    return NextResponse.json({ message: 'Ticket resolved successfully' }, { status: 200 });
}
