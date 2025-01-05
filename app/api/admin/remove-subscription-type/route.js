// app/api/admin/remove-subscription-type/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from 'utils/authUtils';
import { removeSubscriptionType } from 'utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id } = await req.json();
        const result = await removeSubscriptionType(id);

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
