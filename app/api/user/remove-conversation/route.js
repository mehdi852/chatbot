import { db } from '@/configs/db';
import { ChatConversations, ChatMessages } from '@/configs/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
    const searchParams = request.nextUrl.searchParams;
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
        return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
    }

    try {
        // Find the conversation ID first
        const conversations = await db.select({ id: ChatConversations.id }).from(ChatConversations).where(eq(ChatConversations.visitor_id, visitorId));

        if (conversations.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversationId = conversations[0].id;

        // Delete related messages first (due to foreign key constraint)
        await db.delete(ChatMessages).where(eq(ChatMessages.conversation_id, conversationId));

        // Then delete the conversation
        await db.delete(ChatConversations).where(eq(ChatConversations.id, conversationId));

        return NextResponse.json({ message: 'Conversation deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
