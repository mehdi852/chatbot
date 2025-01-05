import { db } from '@/configs/db';
import { SubscriptionsTypes, SubscriptionLimits, SubscritpionsFeatures } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable static caching
export const revalidate = 0; // Disable revalidation caching

export async function GET() {
    try {

        // First get all subscriptions (for debugging)
        const allSubscriptions = await db.select().from(SubscriptionsTypes);


        // Now fetch active subscriptions - using select() without field mapping first
        const subscriptions = await db.select().from(SubscriptionsTypes).where(eq(SubscriptionsTypes.status, true));


        if (!subscriptions || subscriptions.length === 0) {
            return new NextResponse(JSON.stringify([]), {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'Content-Type': 'application/json',
                },
            });
        }

        // For each subscription, fetch its limits and features
        const fullSubscriptionData = await Promise.all(
            subscriptions.map(async (sub) => {

                // Fetch limits
                const limits = await db.select().from(SubscriptionLimits).where(eq(SubscriptionLimits.subscription_type_id, sub.id));

                // Fetch features
                const features = await db.select().from(SubscritpionsFeatures).where(eq(SubscritpionsFeatures.subscription_id, sub.id));

                // Return the structured data
                return {
                    id: sub.id,
                    name: sub.name,
                    price: sub.price,
                    yearlyPrice: sub.yearlyPrice,
                    status: sub.status,
                    stripeMonthlyLink: sub.stripeMonthlyLink,
                    stripeYearlyLink: sub.stripeYearlyLink,
                    limits: limits[0] || null,
                    features: features.length > 0 ? features.map((f) => f.name) : [],
                };
            })
        );

        return new NextResponse(JSON.stringify(fullSubscriptionData), {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
        });
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to fetch subscriptions',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            }),
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
