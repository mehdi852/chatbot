

import { SocialMediaLinks } from '@/configs/schema';
import { db } from '@/configs/db';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function DELETE(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { id } = await req.json();
    try {
        await db.delete(SocialMediaLinks).where(eq(SocialMediaLinks.id, id));
        return NextResponse.json({ message: 'Social link removed successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

 