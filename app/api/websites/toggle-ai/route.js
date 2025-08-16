import { db } from '@/configs/db.server';
import { Websites } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { websiteId, isAiEnabled } = await req.json();

        if (!websiteId) {
            return new Response(JSON.stringify({ error: 'Website ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('Toggling AI for website:', {
            websiteId,
            newState: isAiEnabled,
        });

        // Update the website's AI status
        const [updated] = await db.update(Websites).set({ isAiEnabled }).where(eq(Websites.id, websiteId)).returning();

        console.log('Updated website:', updated);

        return new Response(JSON.stringify({ success: true, website: updated }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to toggle AI:', error);
        return new Response(JSON.stringify({ error: 'Failed to toggle AI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
