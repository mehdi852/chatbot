import { SocialMediaLinks } from '@/configs/schema';
import { db } from '@/configs/db.server';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { image_url, name, url } = await req.json();
    try {
        await db.insert(SocialMediaLinks).values({
            image_url,
            name,
            url,
        });
        return NextResponse.json({ message: 'Social link added successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
