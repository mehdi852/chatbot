import { db } from '@/configs/db.server';
import { SocialMediaLinks } from '@/configs/schema';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
    revalidatePath('/admin/settings');
    try {
        const socialLinks = await db.select().from(SocialMediaLinks);
        return NextResponse.json(socialLinks);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
