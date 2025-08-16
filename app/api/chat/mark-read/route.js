import { db } from '@/configs/db.server';
import { ChatConversations, ChatMessages, Websites } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
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

export async function POST(request) {
    try {
        const body = await request.json();
        const { websiteId, visitorId, userId } = body;

        if (!websiteId || !visitorId || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Verify website ownership
        const isOwner = await verifyWebsiteOwnership(websiteId, userId);
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Find conversation
        const conversations = await db
            .select()
            .from(ChatConversations)
            .where(and(eq(ChatConversations.website_id, parseInt(websiteId)), eq(ChatConversations.visitor_id, visitorId)));

        if (conversations.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = conversations[0];

        // Mark all unread visitor messages in this conversation as read
        await db
            .update(ChatMessages)
            .set({ read: true })
            .where(and(eq(ChatMessages.conversation_id, conversation.id), eq(ChatMessages.read, false), eq(ChatMessages.type, 'visitor')));

        return NextResponse.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
