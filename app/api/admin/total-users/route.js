// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getLatestUsers, getTotalUsers } from '@/utils/AdminUtils';
import { totalNewUsers } from '@/utils/AdminUtils';

export async function GET(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    // Call the utility function to check if the user is an admin

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    // If the user is an admin, return the appropriate response

    const totalUsers = await getTotalUsers();

    const newUsers = await totalNewUsers();
    const latestUsers = await getLatestUsers();

    return NextResponse.json({ totalUsers, newUsers, latestUsers }, { status });
}
