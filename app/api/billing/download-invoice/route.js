import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/configs/db.server';
import { Invoices, Users, UsersSubscriptions } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');
        const userId = searchParams.get('userId');

        if (!invoiceId || !userId) {
            return NextResponse.json({ error: 'Invoice ID and User ID are required' }, { status: 400 });
        }

        // Verify the invoice belongs to the user
        const invoice = await db
            .select()
            .from(Invoices)
            .where(and(eq(Invoices.id, invoiceId), eq(Invoices.user_id, userId)))
            .limit(1);

        if (!invoice.length) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const invoiceData = invoice[0];

        // If it's a Stripe invoice (has a proper Stripe invoice number), download from Stripe
        if (invoiceData.invoice_number && invoiceData.invoice_number.startsWith('in_')) {
            try {
                // Get the Stripe invoice
                const stripeInvoice = await stripe.invoices.retrieve(invoiceData.invoice_number);
                
                if (stripeInvoice.invoice_pdf) {
                    // Return the PDF URL for download
                    return NextResponse.json({ 
                        downloadUrl: stripeInvoice.invoice_pdf,
                        hosted_invoice_url: stripeInvoice.hosted_invoice_url
                    });
                }
            } catch (stripeError) {
                console.error('Error fetching Stripe invoice:', stripeError);
                // Fall through to generate a custom invoice
            }
        }

        // Generate a simple invoice PDF URL or data (fallback for custom invoices)
        return NextResponse.json({
            error: 'PDF generation not available for this invoice type',
            invoice: invoiceData
        }, { status: 200 });

    } catch (error) {
        console.error('Error in download-invoice API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Alternative endpoint to get Stripe invoice details
export async function POST(request) {
    try {
        const { invoiceId, userId } = await request.json();

        if (!invoiceId || !userId) {
            return NextResponse.json({ error: 'Invoice ID and User ID are required' }, { status: 400 });
        }

        // Verify the invoice belongs to the user
        const invoice = await db
            .select()
            .from(Invoices)
            .where(and(eq(Invoices.id, invoiceId), eq(Invoices.user_id, userId)))
            .limit(1);

        if (!invoice.length) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const invoiceData = invoice[0];

        // If it's a Stripe invoice, get additional details from Stripe
        if (invoiceData.invoice_number && invoiceData.invoice_number.startsWith('in_')) {
            try {
                const stripeInvoice = await stripe.invoices.retrieve(invoiceData.invoice_number, {
                    expand: ['customer', 'subscription', 'payment_intent']
                });

                return NextResponse.json({
                    ...invoiceData,
                    stripe_data: {
                        hosted_invoice_url: stripeInvoice.hosted_invoice_url,
                        invoice_pdf: stripeInvoice.invoice_pdf,
                        status: stripeInvoice.status,
                        paid: stripeInvoice.paid,
                        subtotal: stripeInvoice.subtotal,
                        total: stripeInvoice.total,
                        currency: stripeInvoice.currency,
                        customer_email: stripeInvoice.customer?.email,
                        period_start: stripeInvoice.period_start,
                        period_end: stripeInvoice.period_end,
                        lines: stripeInvoice.lines.data.map(line => ({
                            description: line.description,
                            amount: line.amount,
                            currency: line.currency,
                            period: line.period
                        }))
                    }
                });
            } catch (stripeError) {
                console.error('Error fetching Stripe invoice details:', stripeError);
            }
        }

        return NextResponse.json({ invoice: invoiceData });

    } catch (error) {
        console.error('Error in get invoice details API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
