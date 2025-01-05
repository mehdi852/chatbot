// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getUsersPerPage } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);
    // Call the utility function to check if the user is an admin
    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    // If the user is an admin, return the appropriate response

    // get pageNumber and usersPerPage from the request body

    const { pageNumber, usersPerPage } = await req.json();

    const returnedUsersPerPage = await getUsersPerPage(pageNumber, usersPerPage);

    return NextResponse.json({ returnedUsersPerPage }, { status });
}
