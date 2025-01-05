export const dynamic = 'force-dynamic';
// app/api/admin/route.js
import { NextResponse } from 'next/server';

import { getGeneralSettings } from '@/utils/AdminUtils';
export async function GET(req) {
    try {
        const generalSettings = await getGeneralSettings();
        return NextResponse.json({ generalSettings }, { status: 200 });
    } catch (error) {
        console.error('GET /api/public/get-general-settings - error', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
