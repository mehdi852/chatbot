import { db } from '@/configs/db';
import { Websites } from '@/configs/schema';
import { eq } from 'drizzle-orm';

async function getWebsiteData(websiteId) {
    const websites = await db.select().from(Websites).where(eq(Websites.id, websiteId));
    return websites[0];
}

export async function setupSocketAuth(socket, next) {
    console.log('Socket authentication attempt:', {
        query: socket.handshake.query,
    });

    try {
        const { websiteId, userId, type, visitorId } = socket.handshake.query;
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
            user_id: userId,
        };

        // Different validation for admin and visitor
        if (type === 'admin') {
            if (!userId) {
                return next(new Error('Missing userId for admin connection'));
            }
            socket.isAdmin = true;
            socket.userId = userId;
        } else if (type === 'visitor') {
            if (!visitorId) {
                return next(new Error('Missing visitorId for visitor connection'));
            }
            socket.isAdmin = false;
            socket.visitorId = visitorId;
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
