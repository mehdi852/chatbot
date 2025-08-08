import { db } from '@/configs/db';
import { ChatConversations, ChatMessages } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

export async function getOrCreateConversation(websiteId, visitorId) {
    const conversations = await db
        .select()
        .from(ChatConversations)
        .where(and(eq(ChatConversations.website_id, websiteId), eq(ChatConversations.visitor_id, visitorId)));

    if (conversations.length > 0) {
        return { conversation: conversations[0], isNew: false };
    }

    const [newConversation] = await db
        .insert(ChatConversations)
        .values({
            website_id: websiteId,
            visitor_id: visitorId,
        })
        .returning();

    return { conversation: newConversation, isNew: true };
}

export async function saveMessage(conversationId, message, type) {
    const [savedMessage] = await db
        .insert(ChatMessages)
        .values({
            conversation_id: conversationId,
            message: message,
            type: type,
        })
        .returning();

    await db.update(ChatConversations).set({ last_message_at: new Date() }).where(eq(ChatConversations.id, conversationId));

    return savedMessage;
}
