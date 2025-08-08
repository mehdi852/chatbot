import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { eq, and } from 'drizzle-orm';
import { Websites, Users, UsersSubscriptions, SubscriptionLimits, SubscriptionsTypes } from '@/configs/schema';

export async function POST(req) {
    try {
        const { websiteId } = await req.json();

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
        }

        // 1. Get website and associated user
        const website = await db.select().from(Websites).where(eq(Websites.id, websiteId)).limit(1);

        if (!website || website.length === 0) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 });
        }

        // 2. Get user and their usage
        const user = await db.select().from(Users).where(eq(Users.id, website[0].user_id)).limit(1);

        if (!user || user.length === 0) {
            // Return eligible if user not found to allow chat to work
            console.warn('User not found for website:', websiteId);
            return NextResponse.json({ 
                eligible: true, 
                limits: {
                    conversations: { current: 0, max: 1000, remaining: 1000 },
                    aiResponses: { current: 0, max: 1000, remaining: 1000 }
                },
                warning: 'User not found - allowing access'
            });
        }

        // 3. Get user's current subscription
        const userSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, user[0].id)).orderBy(UsersSubscriptions.created_at).limit(1);

        let subscriptionTypeId;

        if (!userSubscription || userSubscription.length === 0 || userSubscription[0].status !== 'active') {
            // If no active subscription, get the Free subscription type
            const freeSubscription = await db
                .select()
                .from(SubscriptionsTypes)
                .where(and(eq(SubscriptionsTypes.name, 'Free'), eq(SubscriptionsTypes.status, true)))
                .limit(1);

            if (!freeSubscription || freeSubscription.length === 0) {
                return NextResponse.json({ error: 'Free subscription plan not found' }, { status: 404 });
            }

            subscriptionTypeId = freeSubscription[0].id;
        } else {
            subscriptionTypeId = userSubscription[0].subscription_type_id;
        }

        // 4. Get subscription limits
        const subscriptionLimits = await db.select().from(SubscriptionLimits).where(eq(SubscriptionLimits.subscription_type_id, subscriptionTypeId)).limit(1);

        if (!subscriptionLimits || subscriptionLimits.length === 0) {
            return NextResponse.json({ error: 'Subscription limits not found' }, { status: 404 });
        }

        // 5. Compare usage with limits
        const isUnderConversationLimit = user[0].number_of_conversations < subscriptionLimits[0].max_chat_conversations;
        const isUnderAiResponseLimit = user[0].number_of_ai_responses < subscriptionLimits[0].max_ai_responses;

        // 6. Return eligibility status
        const isEligible = isUnderConversationLimit && isUnderAiResponseLimit;

        return NextResponse.json({
            eligible: isEligible,
            limits: {
                conversations: {
                    current: user[0].number_of_conversations,
                    max: subscriptionLimits[0].max_chat_conversations,
                    remaining: subscriptionLimits[0].max_chat_conversations - user[0].number_of_conversations,
                },
                aiResponses: {
                    current: user[0].number_of_ai_responses,
                    max: subscriptionLimits[0].max_ai_responses,
                    remaining: subscriptionLimits[0].max_ai_responses - user[0].number_of_ai_responses,
                },
            },
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
