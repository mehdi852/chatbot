import { db } from '@/configs/db.server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as schema from '@/configs/schema';

// Group tables by their dependencies (in reverse order for dropping)
const TABLE_GROUPS = {
    stats: ['dashboard_stats'],
    websiteRelated: ['collected_emails', 'website_popups', 'website_paths', 'websites'],
    subscriptionRelated: ['users_subscriptions', 'subscription_limits', 'subscriptions_features', 'subscriptions_types'],
    ticketRelated: ['ticket_messages', 'visitors_ticket_messages'],
    userRelated: ['user_tickets', 'invoices'],
    core: ['footer_company_links', 'footer_sitemap_links', 'social_media_links', 'newsletter_subscriptions', 'pages', 'meta_data', 'users'],
};

export async function POST() {
    try {
        // Drop tables in reverse dependency order
        for (const [groupName, tableNames] of Object.entries(TABLE_GROUPS)) {
            console.log(`Dropping ${groupName} tables if they exist...`);

            for (const tableName of tableNames) {
                try {
                    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
                    console.log(`Dropped table if existed: ${tableName}`);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`Error dropping table ${tableName}:`, error);
                }
            }
        }

        // Now create tables in the correct order (reverse the groups to create in correct dependency order)
        const createGroups = {
            core: ['users', 'meta_data', 'pages', 'newsletter_subscriptions', 'social_media_links', 'footer_sitemap_links', 'footer_company_links'],
            userRelated: ['user_tickets', 'invoices'],
            ticketRelated: ['ticket_messages', 'visitors_ticket_messages'],
            subscriptionRelated: ['subscriptions_types', 'subscriptions_features', 'subscription_limits', 'users_subscriptions'],
            websiteRelated: ['websites', 'website_paths', 'website_popups', 'collected_emails'],
            stats: ['dashboard_stats'],
        };

        for (const [groupName, tableNames] of Object.entries(createGroups)) {
            console.log(`Creating ${groupName} tables...`);

            for (const tableName of tableNames) {
                try {
                    const createTableSQL = await generateCreateTableSQL(tableName);
                    await db.execute(sql.raw(createTableSQL));
                    console.log(`Created table: ${tableName}`);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`Error creating table ${tableName}:`, error);
                    throw new Error(`Failed to create table ${tableName}: ${error.message}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Database tables created successfully',
            details: 'All tables have been recreated',
        });
    } catch (error) {
        console.error('Database installation error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create database tables',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

async function generateCreateTableSQL(tableName) {
    // Map of table names to their schema definitions
    const tableSchemas = {
        users: `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                imageUrl VARCHAR NOT NULL,
                role VARCHAR NOT NULL DEFAULT 'user',
                subscription BOOLEAN NOT NULL DEFAULT false,
                subscription_ends_at TIMESTAMP,
                status VARCHAR NOT NULL DEFAULT 'active',
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        meta_data: `
            CREATE TABLE IF NOT EXISTS meta_data (
                id SERIAL PRIMARY KEY,
                logo_url VARCHAR NOT NULL,
                site_title VARCHAR NOT NULL,
                site_description VARCHAR NOT NULL,
                site_keywords VARCHAR NOT NULL,
                google_analytics_id VARCHAR NOT NULL,
                address VARCHAR NOT NULL,
                phone VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                maintenance_mode BOOLEAN NOT NULL DEFAULT false
            )
        `,
        pages: `
            CREATE TABLE IF NOT EXISTS pages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL
            )
        `,
        newsletter_subscriptions: `
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id SERIAL PRIMARY KEY,
                email VARCHAR NOT NULL,
                subscribed_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        social_media_links: `
            CREATE TABLE IF NOT EXISTS social_media_links (
                id SERIAL PRIMARY KEY,
                image_url VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        footer_sitemap_links: `
            CREATE TABLE IF NOT EXISTS footer_sitemap_links (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL
            )
        `,
        footer_company_links: `
            CREATE TABLE IF NOT EXISTS footer_company_links (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL
            )
        `,
        user_tickets: `
            CREATE TABLE IF NOT EXISTS user_tickets (
                ticket_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT false,
                name VARCHAR NOT NULL,
                resolved BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        invoices: `
            CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                invoice_number VARCHAR(50) NOT NULL,
                date TIMESTAMP NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        ticket_messages: `
            CREATE TABLE IF NOT EXISTS ticket_messages (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER REFERENCES user_tickets(ticket_id) NOT NULL,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                subject VARCHAR NOT NULL,
                body VARCHAR NOT NULL,
                is_admin BOOLEAN NOT NULL DEFAULT false,
                date TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        visitors_ticket_messages: `
            CREATE TABLE IF NOT EXISTS visitors_ticket_messages (
                id SERIAL PRIMARY KEY,
                email VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                subject VARCHAR NOT NULL DEFAULT 'No subject',
                is_read BOOLEAN NOT NULL DEFAULT false,
                body VARCHAR NOT NULL,
                date TIMESTAMP NOT NULL DEFAULT NOW(),
                resolved BOOLEAN NOT NULL DEFAULT false
            )
        `,
        subscriptions_types: `
            CREATE TABLE IF NOT EXISTS subscriptions_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status BOOLEAN NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                yearly_price DECIMAL(10,2) NOT NULL,
                stripe_monthly_link VARCHAR(255) NOT NULL DEFAULT '',
                stripe_yearly_link VARCHAR(255) NOT NULL DEFAULT '',
                stripe_monthly_price_id VARCHAR(255) NOT NULL DEFAULT '',
                stripe_yearly_price_id VARCHAR(255) NOT NULL DEFAULT '',
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        subscriptions_features: `
            CREATE TABLE IF NOT EXISTS subscriptions_features (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                subscription_id INTEGER REFERENCES subscriptions_types(id)
            )
        `,
        subscription_limits: `
            CREATE TABLE IF NOT EXISTS subscription_limits (
                id SERIAL PRIMARY KEY,
                subscription_type_id INTEGER REFERENCES subscriptions_types(id) NOT NULL,
                max_websites INTEGER NOT NULL DEFAULT 1,
                max_paths_per_website INTEGER NOT NULL DEFAULT 3,
                max_popups_per_path INTEGER NOT NULL DEFAULT 5,
                allow_advertising BOOLEAN NOT NULL DEFAULT false,
                allow_email_collector BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        users_subscriptions: `
            CREATE TABLE IF NOT EXISTS users_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                subscription_type_id INTEGER REFERENCES subscriptions_types(id) NOT NULL,
                stripe_subscription_id VARCHAR(255) NOT NULL,
                stripe_customer_id VARCHAR(255) NOT NULL,
                stripe_price_id VARCHAR(255) NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                status VARCHAR(20) NOT NULL,
                auto_renew BOOLEAN NOT NULL DEFAULT true,
                cancellation_date TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        websites: `
            CREATE TABLE IF NOT EXISTS websites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                domain VARCHAR NOT NULL,
                favicon VARCHAR NOT NULL,
                color VARCHAR NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        website_paths: `
            CREATE TABLE IF NOT EXISTS website_paths (
                id SERIAL PRIMARY KEY,
                website_id INTEGER REFERENCES websites(id) NOT NULL,
                name VARCHAR NOT NULL,
                path VARCHAR NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        website_popups: `
            CREATE TABLE IF NOT EXISTS website_popups (
                id SERIAL PRIMARY KEY,
                path_id INTEGER REFERENCES website_paths(id) NOT NULL,
                order_num INTEGER NOT NULL DEFAULT 0,
                type VARCHAR NOT NULL DEFAULT 'message',
                title VARCHAR NOT NULL,
                message TEXT NOT NULL,
                icon VARCHAR NOT NULL,
                timestamp VARCHAR NOT NULL,
                link VARCHAR,
                button_text VARCHAR,
                placeholder_text VARCHAR,
                success_message VARCHAR,
                delay INTEGER NOT NULL DEFAULT 0,
                duration VARCHAR NOT NULL DEFAULT '7000',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
        collected_emails: `
            CREATE TABLE IF NOT EXISTS collected_emails (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                popup_id INTEGER REFERENCES website_popups(id) NOT NULL,
                website_id INTEGER REFERENCES websites(id) NOT NULL,
                path_id INTEGER REFERENCES website_paths(id) NOT NULL,
                email VARCHAR NOT NULL,
                name VARCHAR,
                status VARCHAR(20) NOT NULL DEFAULT 'active',
                source_url VARCHAR,
                ip_address VARCHAR,
                user_agent VARCHAR,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                unsubscribed_at TIMESTAMP
            )
        `,
        dashboard_stats: `
            CREATE TABLE IF NOT EXISTS dashboard_stats (
                id SERIAL PRIMARY KEY,
                total_websites INTEGER NOT NULL DEFAULT 0,
                total_paths INTEGER NOT NULL DEFAULT 0,
                total_popups INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `,
    };

    const sql = tableSchemas[tableName];
    if (!sql) {
        throw new Error(`No schema definition found for table: ${tableName}`);
    }

    return sql;
}
