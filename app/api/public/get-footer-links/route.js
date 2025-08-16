import { FooterSitemapLinks, FooterCompanyLinks } from '@/configs/schema';
import { db } from '@/configs/db.server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        revalidatePath('/admin/settings');
        const sitemapLinks = await db.select().from(FooterSitemapLinks);
        const companyLinks = await db.select().from(FooterCompanyLinks);
        return NextResponse.json({ sitemapLinks, companyLinks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
