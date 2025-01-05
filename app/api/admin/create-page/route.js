// app/api/admin/add-feature-subscriptionType/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { createSubscriptionFeature, createPage } from '@/utils/AdminUtils';
import { revalidatePath } from 'next/cache';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);
    revalidatePath('/');

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { name, content } = await req.json();

        const page = await createPage(name, content);

        return NextResponse.json({ page }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


