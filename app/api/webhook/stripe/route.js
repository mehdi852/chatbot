import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUserSubscription, getSubscriptionTypeByPriceId, getUserByEmail, updateUserSubscriptionStatus } from '@/utils/AdminUtils';
import { db } from '@/configs/db';
import { Users, UsersSubscriptions, Invoices } from '@/configs/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to reset user's project
async function resetUserProject(userId) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/reset-project`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            console.error('Failed to reset project for user:', userId);
        }
    } catch (error) {
        console.error('Error resetting project:', error);
    }
}

export async function POST(request) {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    let event;
    let eventType;
    let data;

    /// verify Stripe event is legit

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error(`Stripe webhook verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    eventType = event.type;
    data = event.data;

    /// handle the event
    try {
        switch (eventType) {
            case 'checkout.session.completed': {
                const session = await stripe.checkout.sessions.retrieve(data.object.id, { expand: ['line_items'] });
                const customerId = session?.customer;
                const customer = await stripe.customers.retrieve(customerId);

                const priceId = session?.line_items?.data[0]?.price?.id;
                const subscriptionType = await getSubscriptionTypeByPriceId(priceId);

                if (!subscriptionType || subscriptionType.length === 0) {
                    console.error('No subscription type found for price ID:', priceId);
                    break;
                }

                const user = await getUserByEmail(customer.email);

                if (!user) break;

                const startDate = new Date(session.created * 1000);
                let endDate;

                // Determine if it's a monthly or yearly plan
                if (priceId === subscriptionType[0].stripeMonthlyPriceId) {
                    // Monthly plan: add 30 days
                    endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                } else if (priceId === subscriptionType[0].stripeYearlyPriceId) {
                    // Yearly plan: add 365 days
                    endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
                } else {
                    console.error('Unexpected price ID:', priceId);
                    break;
                }

                // Check for existing subscription
                const existingSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, user[0].id)).limit(1);

                if (existingSubscription.length > 0) {
                    // Update existing subscription
                    await db
                        .update(UsersSubscriptions)
                        .set({
                            stripe_customer_id: customer.id,
                            subscription_type_id: subscriptionType[0].id,
                            stripe_subscription_id: session.id,
                            stripe_price_id: priceId,
                            start_date: startDate,
                            end_date: endDate,
                            status: 'active',
                            auto_renew: true,
                        })
                        .where(eq(UsersSubscriptions.id, existingSubscription[0].id));

                } else {
                    // Create new subscription
                    await createUserSubscription(user[0].id, customer.id, subscriptionType[0].id, session.id, priceId, startDate, endDate);

                }

                // Update user's subscription status
                await db
                    .update(Users)
                    .set({
                        subscription: true,
                        subscription_ends_at: endDate,
                    })
                    .where(eq(Users.id, user[0].id));

                // Create invoice record
                const invoiceNumber = `INV-${Date.now()}`; // Generate unique invoice number
                await db.insert(Invoices).values({
                    user_id: user[0].id,
                    invoice_number: invoiceNumber,
                    date: new Date(),
                    amount: parseFloat((session.amount_total / 100).toFixed(2)), // Ensure it's stored as a number
                    status: 'paid',
                });


                break;
            }
            case 'customer.subscription.updated': {
                const subscription = data.object;
                const stripeCustomerId = subscription.customer;

                // If subscription is canceled, ended, or unpaid
                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    // Find the user subscription in our database
                    const userSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId)).limit(1);

                    if (userSubscription.length > 0) {
                        // Update subscription status
                        await db
                            .update(UsersSubscriptions)
                            .set({
                                status: 'inactive',
                                auto_renew: false,
                            })
                            .where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId));

                        // Update user's subscription status
                        await db
                            .update(Users)
                            .set({
                                subscription: false,
                                subscription_ends_at: new Date(), // Set to current date as subscription is ended
                            })
                            .where(eq(Users.id, userSubscription[0].user_id));

                        // Reset user's project
                        await resetUserProject(userSubscription[0].user_id);

                    }
                }
                break;
            }
            case 'invoice.paid': {
                const invoice = data.object;
                const stripeCustomerId = invoice.customer;
                const subscriptionId = invoice.subscription;

                // Find the user subscription in our database
                const userSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId)).limit(1);

                if (userSubscription.length === 0) {
                    console.error(`No user subscription found for Stripe customer ID: ${stripeCustomerId}`);
                    break;
                }

                // Calculate new end date (extend by 30 days)
                const newEndDate = new Date(userSubscription[0].end_date);
                newEndDate.setDate(newEndDate.getDate() + 30);

                // Update the user subscription end date
                await db
                    .update(UsersSubscriptions)
                    .set({
                        end_date: newEndDate,
                        status: 'active', // Ensure the status is set to active
                    })
                    .where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId));

                // Update the user's subscription status and end date
                await db
                    .update(Users)
                    .set({
                        subscription: true,
                        subscription_ends_at: newEndDate,
                    })
                    .where(eq(Users.id, userSubscription[0].user_id));

                // Add new invoice record
                await db.insert(Invoices).values({
                    user_id: userSubscription[0].user_id,
                    invoice_number: invoice.number,
                    date: new Date(invoice.created * 1000), // Convert timestamp to Date
                    amount: parseFloat((invoice.amount_paid / 100).toFixed(2)), // Ensure it's stored as a number
                    status: invoice.status,
                });

                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = data.object;
                const stripeCustomerId = subscription.customer;

                // Find the user subscription in our database
                const userSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId)).limit(1);

                if (userSubscription.length > 0) {
                    // Update subscription status
                    await db
                        .update(UsersSubscriptions)
                        .set({
                            status: 'inactive',
                            auto_renew: false,
                        })
                        .where(eq(UsersSubscriptions.stripe_customer_id, stripeCustomerId));

                    // Update user's subscription status
                    await db
                        .update(Users)
                        .set({
                            subscription: false,
                            subscription_ends_at: new Date(), // Set to current date as subscription is ended
                        })
                        .where(eq(Users.id, userSubscription[0].user_id));

                    // Reset user's project
                    await resetUserProject(userSubscription[0].user_id);

                }
                break;
            }
        }
    } catch (err) {
        console.error(`Stripe webhook handling failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
}
