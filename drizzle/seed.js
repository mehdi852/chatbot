import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { MetaData, SubscriptionsTypes, SubscriptionLimits, ContactSettings, ContactFaqs, ContactStats } from '../configs/schema.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL, {
  max: 1, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(sql);

async function seed() {
    console.log('🌱 Starting database seeding...');
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
                    max_chat_conversations: 100,
                    max_ai_responses: 50,
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

        // Check if Contact Settings already exist
        const existingContactSettings = await db.select().from(ContactSettings).limit(1);
        if (existingContactSettings.length === 0) {
            await db.insert(ContactSettings).values({
                support_email: 'support@yourcompany.com',
                support_phone: '+1 (555) 123-4567',
                live_chat_hours: 'Available 9AM - 6PM EST',
                hero_title_line1: 'Lets Start a',
                hero_title_line2: 'Conversation',
                hero_description: 'We are here to help you succeed. Whether you have questions, need support, or want to explore how our platform can transform your business, our team is ready to assist.',
                form_section_title: 'Send Us a Message',
                form_section_description: 'Fill out the form below and we will get back to you within 24 hours',
                faq_section_title: 'Frequently Asked Questions',
                faq_section_description: 'Quick answers to common questions'
            });
            console.log('✅ Contact settings seeded successfully');
        } else {
            console.log('ℹ️ Contact settings already exist, skipping...');
        }

        // Check if Contact Stats already exist
        const existingContactStats = await db.select().from(ContactStats).limit(1);
        if (existingContactStats.length === 0) {
            await db.insert(ContactStats).values([
                { number: '<2h', label: 'Average Response Time', icon: '⚡', order_index: 1 },
                { number: '24/7', label: 'Support Available', icon: '🛡️', order_index: 2 },
                { number: '98%', label: 'Customer Satisfaction', icon: '⭐', order_index: 3 },
                { number: '10K+', label: 'Happy Customers', icon: '🎉', order_index: 4 }
            ]);
            console.log('✅ Contact stats seeded successfully');
        } else {
            console.log('ℹ️ Contact stats already exist, skipping...');
        }

        // Check if Contact FAQs already exist
        const existingContactFaqs = await db.select().from(ContactFaqs).limit(1);
        if (existingContactFaqs.length === 0) {
            await db.insert(ContactFaqs).values([
                {
                    question: 'How quickly do you respond to support requests?',
                    answer: 'We typically respond to all support requests within 2 hours during business hours (9 AM - 6 PM EST). For urgent issues, we offer priority support with even faster response times.',
                    order_index: 1
                },
                {
                    question: 'What support channels are available?',
                    answer: 'We offer multiple support channels including email, live chat, phone support, and our comprehensive knowledge base. Choose the method that works best for your situation.',
                    order_index: 2
                },
                {
                    question: 'Do you offer technical onboarding assistance?',
                    answer: 'Yes! We provide personalized onboarding sessions to help you get started quickly. Our technical team will guide you through setup, integration, and best practices.',
                    order_index: 3
                },
                {
                    question: 'Is support available on weekends?',
                    answer: 'While our standard support hours are Monday-Friday, we do offer weekend support for critical issues and enterprise customers. Emergency support is always available.',
                    order_index: 4
                }
            ]);
            console.log('✅ Contact FAQs seeded successfully');
        } else {
            console.log('ℹ️ Contact FAQs already exist, skipping...');
        }

        console.log('✅ Seed completed successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seed();
