// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { setGeneralSettings } from '@/utils/AdminUtils';
import { revalidatePath } from 'next/cache';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { siteTitle, siteDescription, siteKeywords, googleAnalyticsId, maintenanceMode, logoUrl, siteAddress, sitePhone, siteEmail } = await req.json();

    try {
        await setGeneralSettings(siteTitle, siteDescription, siteKeywords, googleAnalyticsId, maintenanceMode, logoUrl, siteAddress, sitePhone, siteEmail);

        // Revalidate the settings pages
        revalidatePath('/admin/settings');
        revalidatePath('/'); // Revalidate root layout since it uses metadata

        return NextResponse.json({ message: 'Settings updated successfully!' }, { status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
