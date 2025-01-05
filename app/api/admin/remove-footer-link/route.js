import { FooterSitemapLinks, FooterCompanyLinks } from '@/configs/schema';
import { db } from '@/configs/db';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function DELETE(req) { 
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { id,type } = await req.json();
    try {
        if (type === 'sitemap') {
            await db.delete(FooterSitemapLinks).where(eq(FooterSitemapLinks.id, id));
        } else if (type === 'company') {
            await db.delete(FooterCompanyLinks).where(eq(FooterCompanyLinks.id, id));
        }
        return NextResponse.json({ message: 'Footer link removed successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


