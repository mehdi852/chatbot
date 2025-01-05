import { getUserBillingInfo } from '@/utils/AdminUtils';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const billingInfo = await getUserBillingInfo(userId);
        return NextResponse.json(billingInfo);
    } catch (error) {
        console.error('Error in billing API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
