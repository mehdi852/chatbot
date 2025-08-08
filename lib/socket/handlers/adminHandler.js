import { getOrCreateConversation, saveMessage } from '../db';

export async function handleAdminMessage(io, socket, data) {
    if (!socket.isAdmin || parseInt(data.websiteId) !== socket.websiteId) {
        console.error('Unauthorized admin message', {
            isAdmin: socket.isAdmin,
            messageWebsiteId: data.websiteId,
            socketWebsiteId: socket.websiteId,
        });
        return;
    }

    try {
        const { conversation } = await getOrCreateConversation(data.websiteId, data.visitorId);
        await saveMessage(conversation.id, data.message, 'admin');

        const messageData = {
            message: data.message,
            websiteId: data.websiteId,
            visitorId: data.visitorId,
            timestamp: new Date(),
            type: 'admin',
            userId: data.userId,
        };

        // Send to website room (includes both visitors and admins)
        const websiteRoom = `website_${data.websiteId}`;
        io.to(websiteRoom).emit('visitor-receive-message', messageData);

        // No need to broadcast to admin room separately as they are part of the website room
    } catch (error) {
        console.error('Error handling admin message:', error);
    }
}
