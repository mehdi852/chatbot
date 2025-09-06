import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { setContactSettings, setContactFaqs, setContactStats } from '@/utils/AdminUtils';
import { revalidatePath } from 'next/cache';

export async function POST(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { contactSettings, contactFaqs, contactStats } = await req.json();

    try {
        // Update contact settings
        if (contactSettings) {
            await setContactSettings(contactSettings);
        }

        // Update contact FAQs
        if (contactFaqs) {
            await setContactFaqs(contactFaqs);
        }

        // Update contact stats  
        if (contactStats) {
            await setContactStats(contactStats);
        }

        // Revalidate the contact page
        revalidatePath('/contact');
        revalidatePath('/admin/settings');

        return NextResponse.json({ message: 'Contact settings updated successfully!' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
