// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editUserByEmail } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    // Call the utility function to check if the user is an admin

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    // get the email of the user from the request body

    const { user, changedFields } = await req.json();

    try {
        // If the user is an admin, return the appropriate response

        const returnedUser = await editUserByEmail(user.email, user, changedFields);

        return NextResponse.json({ returnedUser }, { status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
