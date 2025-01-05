// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { markTicketAsRead } from '@/utils/AdminUtils';


export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    // Call the utility function to check if the user is an admin

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    // get ticket_id and is_visitor from the request body

    const { ticket_id, is_user } = await req.json();

    try {
        // If the user is an admin, return the appropriate response
        

        const response = await markTicketAsRead(is_user, ticket_id);


        return NextResponse.json({ response }, { status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
