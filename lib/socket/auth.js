import { db } from '@/configs/db';
import { Websites, Users, UsersSubscriptions, SubscriptionsTypes, SubscriptionLimits } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

async function getWebsiteData(websiteId) {
    const websites = await db.select().from(Websites).where(eq(Websites.id, websiteId));
    return websites[0];
}

export async function setupSocketAuth(socket, next) {
    console.log('Socket authentication attempt:', {
        query: socket.handshake.query,
        timestamp: new Date().toISOString(),
    });

    try {
        const { websiteId, userId, type, visitorId, visitorIP } = socket.handshake.query;
        const websiteIdNum = parseInt(websiteId);

        if (!websiteId || isNaN(websiteIdNum)) {
            console.log('Invalid websiteId:', websiteId);
            return next(new Error('Invalid or missing websiteId parameter'));
        }

        if (!type) {
            console.log('Missing type parameter');
            return next(new Error('Missing type parameter'));
        }

        // Get website data from database
        const websiteData = await getWebsiteData(websiteIdNum);
        if (!websiteData) {
            console.log('Website not found:', websiteIdNum);
            return next(new Error('Website not found'));
        }

        // Store data in socket for later use
        socket.websiteData = {
            id: websiteIdNum,
            isAiEnabled: websiteData.isAiEnabled,
            user_id: websiteData.user_id, // Use website's user_id, not the provided userId
        };

        // Different validation for admin and visitor
        if (type === 'admin') {
            if (!userId) {
                return next(new Error('Missing userId for admin connection'));
            }
            // Verify that the userId matches the website's owner
            if (parseInt(userId) !== websiteData.user_id) {
                return next(new Error('Unauthorized: User does not own this website'));
            }
            socket.isAdmin = true;
            socket.userId = userId;
        } else if (type === 'visitor') {
            if (!visitorId) {
                return next(new Error('Missing visitorId for visitor connection'));
            }

            // For visitor connections, we don't check limits at connection time
            // Instead, limits are checked when they send messages or get AI responses
            // This allows the chat widget to always load, but restricts functionality based on limits
            console.log('Visitor connection approved for websiteId:', websiteIdNum, 'visitorId:', visitorId, 'visitorIP:', visitorIP || 'not provided');
            
            socket.isAdmin = false;
            socket.visitorId = visitorId;
            socket.visitorIP = visitorIP || '8.8.8.8'; // Fallback IP
        } else {
            return next(new Error('Invalid connection type'));
        }

        socket.websiteId = websiteIdNum;
        socket.type = type;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        return next(new Error('Authentication failed: ' + error.message));
    }
}
