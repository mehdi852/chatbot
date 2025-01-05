export const dynamic = 'force-dynamic';
import { db } from "@/configs/db";
import { SubscriptionLimits } from "@/configs/schema";
import { revalidatePath } from "next/cache";
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
    try {
        const limits = await db
            .select()
            .from(SubscriptionLimits);


        // Revalidate the admin settings page
        revalidatePath('/admin/settings')

        return new Response(JSON.stringify(limits || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to fetch subscription limits:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch subscription limits' }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}