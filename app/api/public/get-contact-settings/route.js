export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getContactSettings, getContactFaqs, getContactStats } from '@/utils/AdminUtils';

export async function GET(req) {
    try {
        const contactSettings = await getContactSettings();
        const contactFaqs = await getContactFaqs();
        const contactStats = await getContactStats();
        
        return NextResponse.json({ 
            contactSettings,
            contactFaqs, 
            contactStats 
        }, { status: 200 });
    } catch (error) {
        console.error('GET /api/public/get-contact-settings - error', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
