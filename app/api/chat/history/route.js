import { db } from '@/configs/db';
import { ChatConversations, ChatMessages, Websites } from '@/configs/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Helper function to verify website ownership
async function verifyWebsiteOwnership(websiteId, userId) {
    const website = await db
        .select()
        .from(Websites)
        .where(and(eq(Websites.id, parseInt(websiteId)), eq(Websites.user_id, parseInt(userId))))
        .limit(1);

    return website.length > 0;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');
        const userId = searchParams.get('userId');

        if (!websiteId || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Verify website ownership
        const isOwner = await verifyWebsiteOwnership(websiteId, userId);
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get all conversations for this website
        const conversations = await db
            .select({
                id: ChatConversations.id,
                visitor_id: ChatConversations.visitor_id,
                last_message_at: ChatConversations.last_message_at,
            })
            .from(ChatConversations)
            .where(eq(ChatConversations.website_id, parseInt(websiteId)))
            .orderBy(desc(ChatConversations.last_message_at));

        // For each conversation, get the last message and message count
        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conv) => {
                // Get last message
                const lastMessage = await db.select().from(ChatMessages).where(eq(ChatMessages.conversation_id, conv.id)).orderBy(desc(ChatMessages.timestamp)).limit(1);

                // Get message count using count aggregate
                const [messageCount] = await db.select({ value: count() }).from(ChatMessages).where(eq(ChatMessages.conversation_id, conv.id));

                return {
                    visitor_id: conv.visitor_id,
                    last_message: lastMessage[0]?.message || '',
                    last_message_at: conv.last_message_at,
                    message_count: Number(messageCount.value),
                };
            })
        );

        return NextResponse.json({
            conversations: conversationsWithDetails,
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
