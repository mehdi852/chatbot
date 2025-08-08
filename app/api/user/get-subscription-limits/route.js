export const dynamic = 'force-dynamic';

import { db } from '@/configs/db';
import { UsersSubscriptions, SubscriptionLimits, SubscriptionsTypes } from '@/configs/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response('User ID is required', { status: 400 });
        }

        revalidatePath('/dashboard/usage');

        // Get user's current subscription
        const userSubscription = await db
            .select({
                subscription_type_id: UsersSubscriptions.subscription_type_id,
                end_date: UsersSubscriptions.end_date,
                name: SubscriptionsTypes.name,
            })
            .from(UsersSubscriptions)
            .innerJoin(SubscriptionsTypes, eq(UsersSubscriptions.subscription_type_id, SubscriptionsTypes.id))
            .where(and(eq(UsersSubscriptions.user_id, parseInt(userId)), eq(UsersSubscriptions.status, 'active')))
            .limit(1);

        // If no active subscription or subscription is empty, return free tier limits
        if (!userSubscription.length) {
            // First, get the free tier subscription type
            const freeTier = await db.select().from(SubscriptionsTypes).where(ilike(SubscriptionsTypes.name, 'Free')).limit(1);

            if (!freeTier.length) {
                return new Response(JSON.stringify({ error: 'Free tier not found' }), { status: 500 });
            }

            const freeTierLimits = await db.select().from(SubscriptionLimits).where(eq(SubscriptionLimits.subscription_type_id, freeTier[0].id)).limit(1);

            // Added subscription_name here for consistency
            return new Response(JSON.stringify({ ...freeTierLimits[0], subscription_name: 'Free' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get subscription limits
        const limits = await db.select().from(SubscriptionLimits).where(eq(SubscriptionLimits.subscription_type_id, userSubscription[0].subscription_type_id)).limit(1);

        return new Response(JSON.stringify({ ...limits[0], ...userSubscription[0] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to fetch user subscription limits:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch subscription limits' }), { status: 500 });
    }
}
