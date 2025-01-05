import { db } from "@/configs/db";
import { SubscriptionLimits } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { checkIfUserIsAdmin } from '@/utils/authUtils'; 

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
        try {
        const { subscription_type_id, ...updates } = await req.json();

        // First try to update existing record
        const result = await db
            .update(SubscriptionLimits)
            .set({
                ...updates,
                updated_at: new Date(),
            })
            .where(eq(SubscriptionLimits.subscription_type_id, subscription_type_id))
            .returning({ id: SubscriptionLimits.id });

        // If no record was updated, create a new one
        if (!result.length) {
            await db
                .insert(SubscriptionLimits)
                .values({
                    subscription_type_id,
                    ...updates,
                });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to update subscription limits:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to update subscription limits' }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
} 