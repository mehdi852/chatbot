import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { MetaData, SubscriptionsTypes, SubscriptionLimits } from '../configs/schema.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL);
const db = drizzle(sql);

async function seed() {
    try {
        // Check if MetaData already exists
        const existingMetadata = await db.select().from(MetaData).limit(1);
        if (existingMetadata.length === 0) {
            await db.insert(MetaData).values({
                logo_url: '/images/logo.png',
                siteTitle: 'Popup Builder',
                siteDescription: 'Create beautiful popups for your website',
                siteKeywords: 'popup, builder, website, marketing',
                googleAnalyticsId: '',
                address: 'Your Address',
                phone: '+1234567890',
                email: 'support@yourpopupbuilder.com',
                maintenanceMode: false,
            });
            console.log('✅ MetaData seeded successfully');
        } else {
            console.log('ℹ️ MetaData already exists, skipping...');
        }

        // Check if Free subscription already exists
        const existingFreeSubscription = await db.select().from(SubscriptionsTypes).where(eq(SubscriptionsTypes.name, 'Free')).limit(1);

        if (existingFreeSubscription.length === 0) {
            // Seed Free Subscription Type
            const [freeSubscription] = await db
                .insert(SubscriptionsTypes)
                .values({
                    name: 'Free',
                    status: true,
                    price: 0.0,
                    yearlyPrice: 0.0,
                    stripeMonthlyLink: 'dddd',
                    stripeYearlyLink: 'dddd',
                    stripeMonthlyPriceId: 'dddd',
                    stripeYearlyPriceId: 'dddd',
                })
                .returning();

            // Check if subscription limits already exist for this subscription
            const existingLimits = await db.select().from(SubscriptionLimits).where(eq(SubscriptionLimits.subscription_type_id, freeSubscription.id)).limit(1);

            if (existingLimits.length === 0) {
                // Seed Subscription Limits for Free tier
                await db.insert(SubscriptionLimits).values({
                    subscription_type_id: freeSubscription.id,
                    max_websites: 1,
                    max_paths_per_website: 3,
                    max_popups_per_path: 2,
                    allow_advertising: false,
                    allow_email_collector: true,
                });
                console.log('✅ Free subscription and limits seeded successfully');
            } else {
                console.log('ℹ️ Subscription limits already exist, skipping...');
            }
        } else {
            console.log('ℹ️ Free subscription already exists, skipping...');
        }

        console.log('✅ Seed completed successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seed();
