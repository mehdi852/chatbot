// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getUserByEmail } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    // Call the utility function to check if the user is an admin

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    // get the email of the user from the request body

    const { email } = await req.json();

    // If the user is an admin, return the appropriate response

    const returnedUser = await getUserByEmail(email);


    return NextResponse.json({ returnedUser }, { status });
}
