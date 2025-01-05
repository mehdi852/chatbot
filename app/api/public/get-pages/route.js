export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPages } from '@/utils/AdminUtils';
import { revalidatePath } from 'next/cache';

export async function GET() {
    revalidatePath('/');
    try {
        const pages = await getPages();
        
        if (!pages || pages.length === 0) {
            return NextResponse.json({ 
                message: 'No pages found',
                pages: [] 
            }, { status: 404 });
        }


        return NextResponse.json({ pages }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json({ 
            message: 'Internal server error while fetching pages',
            error: error.message 
        }, { status: 500 });
    }
}