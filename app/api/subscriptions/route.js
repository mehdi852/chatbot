import { getSubscriptionsTypes } from '@/utils/AdminUtils';
import { NextResponse } from 'next/server';
export async function GET() {
    try {
        const subscriptions = await getSubscriptionsTypes();


        return new Response(JSON.stringify(subscriptions), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}

