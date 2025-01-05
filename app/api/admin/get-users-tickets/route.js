// app/api/admin/route.js 
;
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { getLatestUsers, getTotalUsers } from '@/utils/AdminUtils';
import { totalNewUsers } from '@/utils/AdminUtils';
import { getUsersTickets } from '@/utils/AdminUtils';

export async function POST(req) {
    try {
        const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

        if (!authorized) {
            console.log('GET /api/admin/get-users-tickets - user is not admin');
            return NextResponse.json({ message }, { status });
        }
        const usersTickets = await getUsersTickets();

        return NextResponse.json({ usersTickets }, { status });
    } catch (error) {
        console.error('GET /api/admin/get-users-tickets - error', error);
        return NextResponse.json({ message: error.message }, { status: 500 });

    }
}
