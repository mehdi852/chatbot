import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
export async function GET(req) {
    const isAdmin = await checkIfUserIsAdmin(req);

    if (!isAdmin) {
        return NextResponse.json({ isAdmin: false }, { status: 403 });
    } else {
        return NextResponse.json({ isAdmin: true });
    }
}
