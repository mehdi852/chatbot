import { getOrCreateConversation, saveMessage } from '../db';
import { generateAIResponse } from '../ai';

async function handleAIResponse(io, socket, data, conversation) {
    const aiResponse = await generateAIResponse(data.message, data.messages);
    await saveMessage(conversation.id, aiResponse, 'ai');

    const aiResponseData = {
        message: aiResponse,
        websiteId: data.websiteId,
        visitorId: data.visitorId,
        timestamp: new Date(),
        type: 'ai',
    };

    // Broadcast to website room (includes both visitors and admins)
    const visitorRoom = `website_${data.websiteId}`;
    io.to(visitorRoom).emit('visitor-receive-message', aiResponseData);
}

export async function handleVisitorMessage(io, socket, data) {
    if (data.websiteId !== socket.websiteId) {
        console.error('Website ID mismatch:', {
            messageWebsiteId: data.websiteId,
            socketWebsiteId: socket.websiteId,
        });
        return;
    }

    try {
        const conversation = await getOrCreateConversation(socket.websiteId, data.visitorId);
        await saveMessage(conversation.id, data.message, 'visitor');

        const visitorMessageData = {
            message: data.message,
            websiteId: data.websiteId,
            visitorId: data.visitorId,
            timestamp: new Date(),
            type: 'visitor',
        };

        // Broadcast to admin room for this website
        const adminRoom = `admin_${socket.websiteId}`;
        io.to(adminRoom).emit('admin-receive-message', visitorMessageData);

        if (socket.websiteData.isAiEnabled) {
            await handleAIResponse(io, socket, data, conversation);
        }
    } catch (error) {
        console.error('Error handling visitor message:', error);
    }
}
