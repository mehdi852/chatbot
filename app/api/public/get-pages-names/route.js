import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { Pages } from '@/configs/schema';
import { revalidatePath } from 'next/cache';

export async function GET() {
    revalidatePath('/');
    try {
        const pages = await db
            .select({
                id: Pages.id,
                name: Pages.name,
            })
            .from(Pages);

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}
