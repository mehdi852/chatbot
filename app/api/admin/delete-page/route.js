// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { db } from '@/configs/db.server';
import { Pages } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function DELETE(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);
    revalidatePath('/');
    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    try {
        const { id } = await req.json();

        // Delete the page from database
        const deletedPage = await db
            .delete(Pages)
            .where(eq(Pages.id, id)) // Changed from Pages.name to Pages.id
            .returning();

        if (!deletedPage || deletedPage.length === 0) {
            return NextResponse.json({ message: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Page deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json({ message: 'Failed to delete page' }, { status: 500 });
    }
}
