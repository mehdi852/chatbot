import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/utils/AdminUtils';
import {checkIfUserIsAdmin} from '@/utils/authUtils';

// we use  req body

export async function POST(request) {
    const { email } = await request.json();
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(request);
    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const user = await getUserByEmail(email);
    return NextResponse.json(user);
}

