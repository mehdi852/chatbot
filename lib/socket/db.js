import { db } from '@/configs/db.server';
import { ChatConversations, ChatMessages } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

// Function to get IP from request headers or socket
function getClientIP(req, socket = null) {
    let ip = null;

    // Try various header sources first (for proxied/load-balanced setups)
    if (req?.headers) {
        const forwarded = req.headers['x-forwarded-for'];
        const real = req.headers['x-real-ip'];
        const cloudflare = req.headers['cf-connecting-ip'];

        if (forwarded) {
            ip = forwarded.split(',')[0].trim();
        } else if (real) {
            ip = real;
        } else if (cloudflare) {
            ip = cloudflare;
        }
    }

    // Try socket connection if no header IP found
    if (!ip && socket) {
        ip = socket.handshake?.address || socket.request?.connection?.remoteAddress || socket.request?.socket?.remoteAddress;
    }

    // Fallback to request connection
    if (!ip && req) {
        ip = req.connection?.remoteAddress || req.socket?.remoteAddress;
    }

    // Clean up the IP address
    if (ip) {
        // Remove IPv6 prefix if present
        ip = ip.replace('::ffff:', '');

        // Handle localhost IPs
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            console.log('🏠 Detected localhost IP, using demo IP for testing');
            // Use a demo IP for localhost testing (Google's public DNS)
            return '8.8.8.8';
        }
    }

    return ip || '8.8.8.8'; // Default to demo IP if no IP detected
}

// Function to get IP geolocation data
async function getIPGeolocation(ip) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/geolocation/ip-lookup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip }),
        });

        if (!response.ok) {
            throw new Error(`Geolocation API error: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching IP geolocation:', error);
        // Return default values if API fails
        return {
            ip: ip || '',
            asn: '',
            as_name: '',
            as_domain: '',
            country_code: '',
            country: '',
            continent_code: '',
            continent: '',
        };
    }
}

async function incrementUserConversationCount(websiteId) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.log(`🔢 Incrementing conversation count for websiteId: ${websiteId}`);

        // Get website's user ID first
        const websiteResponse = await fetch(`${baseUrl}/api/websites/get-website?websiteId=${websiteId}`);
        if (!websiteResponse.ok) {
            throw new Error('Failed to get website info');
        }
        const websiteData = await websiteResponse.json();
        console.log(`👤 Found userId: ${websiteData.user_id} for websiteId: ${websiteId}`);

        // Increment conversation count
        const response = await fetch(`${baseUrl}/api/user/increment-stats?userId=${websiteData.user_id}&stat=conversations`);
        if (!response.ok) {
            throw new Error('Failed to increment conversation count');
        }
        const result = await response.json();
        console.log(`✅ Successfully incremented conversation count. New value: ${result.newValue}`);
        return true;
    } catch (error) {
        console.error('❌ Error incrementing conversation count:', error);
        return false;
    }
}

// Function to check if user can create new conversations
async function checkConversationLimits(websiteId) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/public/check-eligible-limits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteId }),
        });

        if (!response.ok) {
            console.warn('Conversation limits check failed:', response.status);
            // If the check fails, we'll assume the user is eligible (graceful degradation)
            return { eligible: true, error: 'Limits check unavailable' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking conversation limits:', error);
        // Graceful degradation - allow conversations to work if limits check fails
        return { eligible: true, error: 'Limits check unavailable' };
    }
}

export async function getOrCreateConversation(websiteId, visitorId, visitorIP = null) {
    const conversations = await db
        .select()
        .from(ChatConversations)
        .where(and(eq(ChatConversations.website_id, websiteId), eq(ChatConversations.visitor_id, visitorId)));

    if (conversations.length > 0) {
        return { conversation: conversations[0], isNew: false };
    }

    // Check if user can create new conversations before creating one
    const limitsCheck = await checkConversationLimits(websiteId);
    console.log(`🔍 Conversation limits check for websiteId ${websiteId}:`, {
        eligible: limitsCheck.eligible,
        limits: limitsCheck.limits,
        visitorId: visitorId,
    });

    if (!limitsCheck.eligible) {
        console.log(`❌ Conversation limits exceeded for websiteId: ${websiteId}. Cannot create new conversation.`);
        console.log(`❌ Current limits:`, limitsCheck.limits);
        throw new Error('Conversation limit reached. Please upgrade your plan to start new conversations.');
    }

    console.log(`✅ Conversation limits check passed for websiteId: ${websiteId}. Creating new conversation...`);

    // Get IP geolocation data for new conversations only
    let geoData = {
        visitor_ip: visitorIP || '',
        asn: '',
        as_name: '',
        as_domain: '',
        country_code: '',
        country: '',
        continent_code: '',
        continent: '',
    };

    if (visitorIP) {
        try {
            const ipInfo = await getIPGeolocation(visitorIP);
            geoData = {
                visitor_ip: ipInfo.ip,
                asn: ipInfo.asn,
                as_name: ipInfo.as_name,
                as_domain: ipInfo.as_domain,
                country_code: ipInfo.country_code,
                country: ipInfo.country,
                continent_code: ipInfo.continent_code,
                continent: ipInfo.continent,
            };
            console.log('✅ IP Geolocation data fetched for new visitor:', geoData);
        } catch (error) {
            console.error('❌ Failed to fetch IP geolocation data:', error);
        }
    }

    const [newConversation] = await db
        .insert(ChatConversations)
        .values({
            website_id: websiteId,
            visitor_id: visitorId,
            ...geoData,
        })
        .returning();

    // Increment user's conversation count for new conversations
    const incrementSuccess = await incrementUserConversationCount(websiteId);
    if (!incrementSuccess) {
        console.warn('Failed to increment conversation count, but conversation was created successfully');
    }

    return { conversation: newConversation, isNew: true };
}

// Helper function to check if any admins are online for a website
export function isAnyAdminOnline(io, websiteId) {
    if (!global.io) return false;

    const sockets = Array.from(global.io.sockets.sockets.values());
    return sockets.some((socket) => {
        // Check if socket is admin, for the right website, and actually connected
        return socket.isAdmin && socket.websiteId === websiteId && socket.connected && !socket.disconnected;
    });
}

export async function saveMessage(conversationId, message, type, isAdminOnline = false) {
    const [savedMessage] = await db
        .insert(ChatMessages)
        .values({
            conversation_id: conversationId,
            message: message,
            type: type,
            read: isAdminOnline || type !== 'visitor', // Mark as read if admin is online or if it's not a visitor message
        })
        .returning();

    await db.update(ChatConversations).set({ last_message_at: new Date() }).where(eq(ChatConversations.id, conversationId));

    return savedMessage;
}

// Function to mark messages as read
export async function markMessagesAsRead(conversationId, messageIds = null) {
    try {
        if (messageIds && messageIds.length > 0) {
            // Mark specific messages as read
            for (const messageId of messageIds) {
                await db
                    .update(ChatMessages)
                    .set({ read: true })
                    .where(and(eq(ChatMessages.id, messageId), eq(ChatMessages.conversation_id, conversationId)));
            }
        } else {
            // Mark all unread messages in the conversation as read
            await db
                .update(ChatMessages)
                .set({ read: true })
                .where(and(eq(ChatMessages.conversation_id, conversationId), eq(ChatMessages.read, false)));
        }

        return true;
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return false;
    }
}
