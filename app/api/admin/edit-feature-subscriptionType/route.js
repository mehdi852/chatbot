import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editSubscriptionFeature } from '@/utils/AdminUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id, name } = await req.json();

        await editSubscriptionFeature(id, name);

        return NextResponse.json({ message: 'Subscription feature edited successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error editing subscription feature:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
