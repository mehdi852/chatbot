import { boolean, pgTable, serial, varchar, timestamp, integer, decimal, text } from 'drizzle-orm/pg-core';
import { foreignKey } from 'drizzle-orm/pg-core';

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull().unique(),
    imageUrl: varchar('imageUrl').notNull(),
    role: varchar('role').notNull().default('user'),
    subscription: boolean('subscription').notNull().default(false),
    subscription_ends_at: timestamp('subscription_ends_at').default(null),
    number_of_websites: integer('number_of_websites').notNull().default(0),
    number_of_conversations: integer('number_of_conversations').notNull().default(0),
    number_of_ai_responses: integer('number_of_ai_responses').notNull().default(0),
    status: varchar('status').notNull().default('active'),
    created_at: timestamp('created_at').defaultNow().notNull(), // Correct syntax
});

export const UserTickets = pgTable('user_tickets', {
    ticket_id: serial('ticket_id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id) // Foreign key referencing the 'users' table
        .notNull(),
    isRead: boolean('is_read').notNull().default(false),
    // add a field name that takes the name of the user
    name: varchar('name').notNull(),
    resolved: boolean('resolved').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export const TicketMessages = pgTable('ticket_messages', {
    id: serial('id').primaryKey(),
    ticket_id: integer('ticket_id')
        .references(() => UserTickets.ticket_id) // Foreign key referencing the 'user_tickets' table
        .notNull(),
    user_id: integer('user_id')
        .references(() => Users.id) // Foreign key referencing the 'users' table
        .notNull(),
    subject: varchar('subject').notNull(),
    body: varchar('body').notNull(),
    isAdmin: boolean('is_admin').notNull().default(false),
    date: timestamp('date').defaultNow().notNull(), // Automatically sets the current timestamp
});

export const VisitorTicketMessages = pgTable('visitors_ticket_messages', {
    id: serial('id').primaryKey(),
    email: varchar('email').notNull(),
    name: varchar('name').notNull(),
    subject: varchar('subject').notNull().default('No subject'),
    isRead: boolean('is_read').notNull().default(false),
    body: varchar('body').notNull(),
    date: timestamp('date').defaultNow().notNull(), // Automatically sets the current timestamp
    resolved: boolean('resolved').notNull().default(false),
});

// schema for website general Settings all of them with default values im going to have
// siteTitle as site_title
// siteDescription as site_description
// siteKeywords as site_keywords
// googleAnalyticsId as google_analytics_id

export const MetaData = pgTable('meta_data', {
    id: serial('id').primaryKey(),
    logo_url: varchar('logo_url').notNull(),
    siteTitle: varchar('site_title').notNull(),
    siteDescription: varchar('site_description').notNull(),
    siteKeywords: varchar('site_keywords').notNull(),
    googleAnalyticsId: varchar('google_analytics_id').notNull(),
    address: varchar('address').notNull(),
    phone: varchar('phone').notNull(),
    email: varchar('email').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(), // Correct syntax
    maintenanceMode: boolean('maintenance_mode').notNull().default(false),
});

// Subscriptions table
export const SubscriptionsTypes = pgTable('subscriptions_types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    status: boolean('status').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    yearlyPrice: decimal('yearly_price', { precision: 10, scale: 2 }).notNull(),
    stripeMonthlyLink: varchar('stripe_monthly_link', { length: 255 }).notNull().default(''),
    stripeYearlyLink: varchar('stripe_yearly_link', { length: 255 }).notNull().default(''),
    stripeMonthlyPriceId: varchar('stripe_monthly_price_id', { length: 255 }).notNull().default(''),
    stripeYearlyPriceId: varchar('stripe_yearly_price_id', { length: 255 }).notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscriptions Features
export const SubscritpionsFeatures = pgTable('subscriptions_features', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    subscription_id: integer('subscription_id').references(() => SubscriptionsTypes.id), // Foreign key to Plans
});

export const Invoices = pgTable('invoices', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    invoice_number: varchar('invoice_number', { length: 50 }).notNull(),
    date: timestamp('date').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Users Subscriptions table
export const UsersSubscriptions = pgTable('users_subscriptions', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    subscription_type_id: integer('subscription_type_id')
        .references(() => SubscriptionsTypes.id)
        .notNull(),
    stripe_subscription_id: varchar('stripe_subscription_id', { length: 255 }).notNull(),
    stripe_customer_id: varchar('stripe_customer_id', { length: 255 }).notNull(),
    stripe_price_id: varchar('stripe_price_id', { length: 255 }).notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    status: varchar('status', { length: 20 }).notNull(), // e.g., 'active', 'cancelled', 'expired'
    auto_renew: boolean('auto_renew').notNull().default(true),
    cancellation_date: timestamp('cancellation_date'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const Pages = pgTable('pages', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    content: text('content').notNull(),
});

// Table for websites
export const Websites = pgTable('websites', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull().default('name'),
    domain: varchar('domain').notNull(),
    favicon: varchar('favicon').notNull(),
    color: varchar('color').notNull(),
    isAiEnabled: boolean('is_ai_enabled').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Table for notifications
export const Notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    type: varchar('type', { length: 50 }).notNull().default('info'), // message, task, system, alert, info
    priority: varchar('priority', { length: 20 }).notNull().default('low'), // critical, high, medium, low
    read: boolean('read').notNull().default(false),
    action_url: varchar('action_url', { length: 255 }),
    sender_name: varchar('sender_name', { length: 255 }),
    sender_avatar: varchar('sender_avatar', { length: 255 }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Table for paths within websites
export const WebsitePaths = pgTable('website_paths', {
    id: serial('id').primaryKey(),
    website_id: integer('website_id')
        .references(() => Websites.id)
        .notNull(),
    name: varchar('name').notNull(),
    path: varchar('path').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Table for popups within paths
export const WebsitePopups = pgTable('website_popups', {
    id: serial('id').primaryKey(),
    path_id: integer('path_id')
        .references(() => WebsitePaths.id)
        .notNull(),
    order: integer('order').notNull().default(0),
    type: varchar('type').notNull().default('message'),
    title: varchar('title').notNull(),
    message: text('message').notNull(),
    icon: varchar('icon').notNull(),
    timestamp: varchar('timestamp').notNull(),
    link: varchar('link'),
    button_text: varchar('button_text'),
    placeholder_text: varchar('placeholder_text'),
    success_message: varchar('success_message'),
    delay: integer('delay').notNull().default(0), // Delay in milliseconds before showing the popup
    duration: varchar('duration').notNull().default('7000'), // Duration in milliseconds or 'unlimited'
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Update the CollectedEmails table definition
export const CollectedEmails = pgTable('collected_emails', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    popup_id: integer('popup_id')
        .references(() => WebsitePopups.id)
        .notNull(),
    website_id: integer('website_id')
        .references(() => Websites.id)
        .notNull(),
    path_id: integer('path_id')
        .references(() => WebsitePaths.id)
        .notNull(),
    email: varchar('email').notNull(),
    name: varchar('name'),
    status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'unsubscribed', 'bounced'
    source_url: varchar('source_url'),
    ip_address: varchar('ip_address'),
    user_agent: varchar('user_agent'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    unsubscribed_at: timestamp('unsubscribed_at'),
});

// Add this new table for subscription usage limits without the index
export const SubscriptionLimits = pgTable('subscription_limits', {
    id: serial('id').primaryKey(),
    subscription_type_id: integer('subscription_type_id')
        .references(() => SubscriptionsTypes.id)
        .notNull(),
    max_websites: integer('max_websites').notNull().default(1),
    max_paths_per_website: integer('max_paths_per_website').notNull().default(3),
    max_popups_per_path: integer('max_popups_per_path').notNull().default(5),
    max_chat_conversations: integer('max_chat_conversations').notNull().default(1),
    max_ai_responses: integer('max_ai_responses').notNull().default(1),
    allow_advertising: boolean('allow_advertising').notNull().default(false),
    allow_email_collector: boolean('allow_email_collector').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// add a newsletter_subscriptions table
export const NewsletterSubscriptions = pgTable('newsletter_subscriptions', {
    id: serial('id').primaryKey(),
    email: varchar('email').notNull(),
    subscribed_at: timestamp('subscribed_at').defaultNow().notNull(),
});

//  dashboard stats
export const DashboardStats = pgTable('dashboard_stats', {
    id: serial('id').primaryKey(),
    total_websites: integer('total_websites').notNull().default(0),
    total_paths: integer('total_paths').notNull().default(0),
    total_popups: integer('total_popups').notNull().default(0),
    total_conversations: integer('total_conversations').notNull().default(0),
    total_ai_responses: integer('total_ai_responses').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// social media links
export const SocialMediaLinks = pgTable('social_media_links', {
    id: serial('id').primaryKey(),
    image_url: varchar('image_url', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 255 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Footer Sitemap links
export const FooterSitemapLinks = pgTable('footer_sitemap_links', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 255 }).notNull(),
});

// Footer Company links
export const FooterCompanyLinks = pgTable('footer_company_links', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 255 }).notNull(),
});

// Chat Conversations table
export const ChatConversations = pgTable('chat_conversations', {
    id: serial('id').primaryKey(),
    website_id: integer('website_id')
        .references(() => Websites.id)
        .notNull(),
    visitor_id: varchar('visitor_id').notNull(),
    visitor_ip: varchar('visitor_ip', { length: 45 }).notNull().default(''),
    asn: varchar('asn', { length: 20 }).notNull().default(''),
    as_name: varchar('as_name', { length: 255 }).notNull().default(''),
    as_domain: varchar('as_domain', { length: 255 }).notNull().default(''),
    country_code: varchar('country_code', { length: 2 }).notNull().default(''),
    country: varchar('country', { length: 100 }).notNull().default(''),
    continent_code: varchar('continent_code', { length: 2 }).notNull().default(''),
    continent: varchar('continent', { length: 50 }).notNull().default(''),
    last_message_at: timestamp('last_message_at').defaultNow().notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Chat Messages table
export const ChatMessages = pgTable('chat_messages', {
    id: serial('id').primaryKey(),
    conversation_id: integer('conversation_id')
        .references(() => ChatConversations.id)
        .notNull(),
    message: text('message').notNull(),
    type: varchar('type').notNull(), // 'admin' or 'visitor'
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    browser: varchar('browser', { length: 255 }).notNull().default(''),
    country: varchar('country', { length: 255 }).notNull().default(''),
});

// Widget Settings table
export const WidgetSettings = pgTable('widget_settings', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .references(() => Users.id)
        .notNull(),
    primary_color: varchar('primary_color', { length: 7 }).notNull().default('#3b82f6'),
    header_color: varchar('header_color', { length: 7 }).notNull().default('#1e40af'),
    background_color: varchar('background_color', { length: 7 }).notNull().default('#ffffff'),
    text_color: varchar('text_color', { length: 7 }).notNull().default('#374151'),
    button_size: varchar('button_size', { length: 20 }).notNull().default('medium'),
    button_position: varchar('button_position', { length: 20 }).notNull().default('bottom-right'),
    border_radius: varchar('border_radius', { length: 20 }).notNull().default('rounded'),
    welcome_message: text('welcome_message').notNull().default('Hi! How can we help you today?'),
    placeholder_text: varchar('placeholder_text', { length: 255 }).notNull().default('Type your message...'),
    company_name: varchar('company_name', { length: 255 }).notNull().default('Support Team'),
    button_text: varchar('button_text', { length: 255 }).notNull().default('Chat with us'),
    show_branding: boolean('show_branding').notNull().default(true),
    brand_name: varchar('brand_name', { length: 255 }).notNull().default('BirdSeed'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});
