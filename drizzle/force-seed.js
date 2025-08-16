import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { MetaData, SubscriptionsTypes, SubscriptionLimits } from '../configs/schema.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL, {
  max: 1, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(sql);

async function forceSeed() {
    console.log('🌱 Force seeding database (clearing existing data)...');
    try {
        // Clear existing data first
        console.log('🧹 Clearing existing data...');
        await db.delete(SubscriptionLimits);
        await db.delete(SubscriptionsTypes);  
        await db.delete(MetaData);
        
        console.log('📝 Inserting fresh metadata...');
        await db.insert(MetaData).values({
            logo_url: '/images/logo.png',
            siteTitle: 'Chatbot SaaS',
            siteDescription: 'Create beautiful chatbots for your website',
            siteKeywords: 'chatbot, saas, website, ai, chat',
            googleAnalyticsId: '',
            address: 'Your Address',
            phone: '+1234567890',
            email: 'support@chatbotsaas.com',
            maintenanceMode: false,
        });
        console.log('✅ MetaData inserted successfully');

        console.log('📋 Creating Free subscription plan...');
        const [freeSubscription] = await db
            .insert(SubscriptionsTypes)
            .values({
                name: 'Free',
                status: true,
                price: 0.0,
                yearlyPrice: 0.0,
                stripeMonthlyLink: 'free_plan',
                stripeYearlyLink: 'free_plan',
                stripeMonthlyPriceId: 'free_plan',
                stripeYearlyPriceId: 'free_plan',
            })
            .returning();

        console.log('🔒 Setting subscription limits...');
        await db.insert(SubscriptionLimits).values({
            subscription_type_id: freeSubscription.id,
            max_websites: 1,
            max_paths_per_website: 3,
            max_popups_per_path: 2,
            max_chat_conversations: 100,
            max_ai_responses: 50,
            allow_advertising: false,
            allow_email_collector: true,
        });

        console.log('✅ Force seed completed successfully!');
        console.log('📊 Data inserted:');
        console.log('  - Site metadata');
        console.log('  - Free subscription plan');
        console.log('  - Subscription limits');
        
    } catch (error) {
        console.error('❌ Error force seeding database:', error);
    } finally {
        await sql.end(); // Properly close the connection
        process.exit(0);
    }
}

forceSeed();
