import { Server as SocketIOServer } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/configs/db';
import { ChatConversations, ChatMessages, Websites } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
import { handleVisitorMessage } from '@/lib/socket/handlers/visitorHandler';
import { handleAdminMessage } from '@/lib/socket/handlers/adminHandler';
import { setupSocketAuth } from '@/lib/socket/auth';
import { initializeSocket } from '@/lib/socket/initialize';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Helper function to get or create conversation
async function getOrCreateConversation(websiteId, visitorId) {
    const conversations = await db
        .select()
        .from(ChatConversations)
        .where(and(eq(ChatConversations.website_id, websiteId), eq(ChatConversations.visitor_id, visitorId)));

    if (conversations.length > 0) {
        return conversations[0];
    }

    const [newConversation] = await db
        .insert(ChatConversations)
        .values({
            website_id: websiteId,
            visitor_id: visitorId,
        })
        .returning();

    return newConversation;
}

// Helper function to save message
async function saveMessage(conversationId, message, type) {
    const [savedMessage] = await db
        .insert(ChatMessages)
        .values({
            conversation_id: conversationId,
            message: message,
            type: type,
        })
        .returning();

    // Update conversation last_message_at
    await db.update(ChatConversations).set({ last_message_at: new Date() }).where(eq(ChatConversations.id, conversationId));

    return savedMessage;
}

// Helper function to get website data
async function getWebsiteData(websiteId) {
    const websites = await db.select().from(Websites).where(eq(Websites.id, websiteId));
    return websites[0];
}

export async function GET(req) {
    try {
        console.log('Socket server initialization requested');

        if (global.io) {
            console.log('Socket server already running');
            return new Response('Socket is already running');
        }

        const io = await initializeSocket();

        // Middleware to authenticate socket connections
        io.use(setupSocketAuth);

        io.on('connection', (socket) => {
            console.log('Client connected', {
                socketId: socket.id,
                type: socket.type,
                websiteId: socket.websiteId,
                visitorId: socket.visitorId,
                isAdmin: socket.isAdmin,
            });

            // Join website-specific room (for all users)
            const websiteRoom = `website_${socket.websiteId}`;
            socket.join(websiteRoom);

            // Join admin room if it's an admin
            if (socket.isAdmin) {
                const adminRoom = `admin_${socket.websiteId}`;
                socket.join(adminRoom);
            }

            // Handle visitor messages
            socket.on('visitor-message', (data) => handleVisitorMessage(io, socket, data));

            // Handle admin messages
            socket.on('admin-message', (data) => handleAdminMessage(io, socket, data));

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            socket.on('disconnect', (reason) => {
                console.log('Client disconnected', socket.id, reason);
                socket.leave(`website_${socket.websiteId}`);
                if (socket.isAdmin) {
                    socket.leave(`admin_${socket.websiteId}`);
                }
                socket.removeAllListeners();
            });

            // Handle AI state updates
            socket.on('update-ai-state', (data) => {
                if (socket.isAdmin && socket.websiteId === data.websiteId) {
                    const websiteRoom = `website_${data.websiteId}`;
                    const sockets = Array.from(io.sockets.sockets.values()).filter((s) => s.websiteId === data.websiteId);

                    sockets.forEach((s) => {
                        s.websiteData = {
                            ...s.websiteData,
                            isAiEnabled: data.isAiEnabled,
                        };
                    });

                    io.to(websiteRoom).emit('ai-state-changed', {
                        websiteId: data.websiteId,
                        isAiEnabled: data.isAiEnabled,
                    });
                }
            });
        });

        global.io = io;
        return new Response('Socket is running');
    } catch (error) {
        console.error('Socket initialization error:', error);
        return new Response('Failed to start socket server', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
