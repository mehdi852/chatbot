export const dynamic = 'force-dynamic';
import { db } from "@/configs/db";
import { SubscriptionsTypes } from "@/configs/schema";  
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function GET(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    try {
        const subscriptionTypes = await db
            .select({
                id: SubscriptionsTypes.id,
                name: SubscriptionsTypes.name,
            })
            .from(SubscriptionsTypes);

        return NextResponse.json(subscriptionTypes, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch subscription types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription types' }, 
            { status: 500 }
        );
    }
} 