import { db } from '@/configs/db.server';
import { Users } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new Response('User ID is required', { status: 400 });
    }

    try {
        const user = await db.select().from(Users).where(eq(Users.id, userId));

        if (!user || user.length === 0) {
            return new Response('User not found', { status: 404 });
        }

        let usage = {
            number_of_websites: user[0].number_of_websites,
            number_of_conversations: user[0].number_of_conversations,
            number_of_ai_responses: user[0].number_of_ai_responses,
        };

        return new Response(JSON.stringify(usage), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching user usage:', error);
        return new Response('Error fetching user usage', { status: 500 });
    }
}
