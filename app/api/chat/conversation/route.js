import { db } from '@/configs/db';
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

// GET conversation history
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');
        const visitorId = searchParams.get('visitorId');
        const userId = searchParams.get('userId');

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

        let conversation = conversations[0];

        if (!conversation) {
            // Create new conversation if none exists
            const [newConversation] = await db
                .insert(ChatConversations)
                .values({
                    website_id: parseInt(websiteId),
                    visitor_id: visitorId,
                })
                .returning();
            conversation = newConversation;
        }

        // Get messages for this conversation
        const messages = await db.select().from(ChatMessages).where(eq(ChatMessages.conversation_id, conversation.id)).orderBy(ChatMessages.timestamp);

        return NextResponse.json({
            conversation,
            messages,
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST new message
export async function POST(request) {
    try {
        const body = await request.json();
        const { websiteId, visitorId, message, type, userId } = body;

        if (!websiteId || !visitorId || !message || !type || (type === 'admin' && !userId)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // For admin messages, verify website ownership
        if (type === 'admin') {
            const isOwner = await verifyWebsiteOwnership(websiteId, userId);
            if (!isOwner) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }

        // Find conversation
        const conversations = await db
            .select()
            .from(ChatConversations)
            .where(and(eq(ChatConversations.website_id, parseInt(websiteId)), eq(ChatConversations.visitor_id, visitorId)));

        let conversation = conversations[0];

        if (!conversation) {
            // Create new conversation if none exists
            const [newConversation] = await db
                .insert(ChatConversations)
                .values({
                    website_id: parseInt(websiteId),
                    visitor_id: visitorId,
                })
                .returning();
            conversation = newConversation;
        }

        // Update last_message_at
        await db.update(ChatConversations).set({ last_message_at: new Date() }).where(eq(ChatConversations.id, conversation.id));

        // Insert new message
        const [newMessage] = await db
            .insert(ChatMessages)
            .values({
                conversation_id: conversation.id,
                message,
                type,
            })
            .returning();

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
