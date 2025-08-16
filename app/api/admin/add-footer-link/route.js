// add footer link route, it will take a type (sitemap, company) and the name and url

import { FooterSitemapLinks, FooterCompanyLinks } from '@/configs/schema';
import { db } from '@/configs/db.server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { type, name, url } = await req.json();
    revalidatePath('/admin/settings');
    try {
        if (type === 'sitemap') {
            await db.insert(FooterSitemapLinks).values({ name, url });
        } else if (type === 'company') {
            await db.insert(FooterCompanyLinks).values({ name, url });
        }
        return NextResponse.json({ message: 'Footer link added successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
