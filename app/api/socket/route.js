import { Server as SocketIOServer } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/configs/db';
import { ChatConversations, ChatMessages, Websites } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
import { handleVisitorMessage } from '@/lib/socket/handlers/visitorHandler';
import { handleAdminMessage } from '@/lib/socket/handlers/adminHandler';
import { setupSocketAuth } from '@/lib/socket/auth';
import { initializeSocket } from '@/lib/socket/initialize';
import { getOrCreateConversation, saveMessage } from '@/lib/socket/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Note: getOrCreateConversation and saveMessage are now imported from @/lib/socket/db
// which includes conversation limit checking

// Helper function to get website data
async function getWebsiteData(websiteId) {
    const websites = await db.select().from(Websites).where(eq(Websites.id, websiteId));
    return websites[0];
}

// Helper function to check if any admins are online for a website
function isAnyAdminOnline(io, websiteId) {
    const sockets = Array.from(io.sockets.sockets.values());
    return sockets.some(socket => {
        // Check if socket is admin, for the right website, and actually connected
        return socket.isAdmin && 
               socket.websiteId === websiteId && 
               socket.connected && 
               !socket.disconnected;
    });
}

// Store visitor statuses in memory (in production, use Redis or database)
const visitorStatuses = new Map(); // visitorId -> { status: 'online'|'away'|'offline', lastSeen: Date, timeoutId: number }

// Cleanup old visitor statuses to prevent memory leaks
const cleanupOldVisitorStatuses = () => {
    const now = new Date();
    const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, statusData] of visitorStatuses.entries()) {
        if (now - statusData.lastSeen > CLEANUP_THRESHOLD) {
            // Clear any pending timeout
            if (statusData.timeoutId) {
                clearTimeout(statusData.timeoutId);
            }
            visitorStatuses.delete(key);
            console.log(`Cleaned up old visitor status for: ${key}`);
        }
    }
};

// Run cleanup every hour
setInterval(cleanupOldVisitorStatuses, 60 * 60 * 1000);

// Helper function to set visitor status
function setVisitorStatus(io, websiteId, visitorId, status) {
    const key = `${websiteId}_${visitorId}`;
    
    // Clear existing timeout if any
    if (visitorStatuses.has(key) && visitorStatuses.get(key).timeoutId) {
        clearTimeout(visitorStatuses.get(key).timeoutId);
    }
    
    // Update status
    visitorStatuses.set(key, {
        status,
        lastSeen: new Date(),
        websiteId,
        visitorId
    });
    
    // Notify admins about status change
    const adminRoom = `admin_${websiteId}`;
    io.to(adminRoom).emit('visitor-status-changed', {
        websiteId,
        visitorId,
        status,
        timestamp: new Date()
    });
    
    console.log(`Visitor ${visitorId} status changed to: ${status}`);
    
    // If visitor is away, set timeout to remove them after 3 minutes
    if (status === 'away') {
        const timeoutId = setTimeout(() => {
            console.log(`Removing visitor ${visitorId} after timeout`);
            setVisitorStatus(io, websiteId, visitorId, 'offline');
            visitorStatuses.delete(key);
        }, 3 * 60 * 1000); // 3 minutes
        
        visitorStatuses.set(key, {
            ...visitorStatuses.get(key),
            timeoutId
        });
    }
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
                
                // Notify all visitors in this website that an agent is online
                socket.to(websiteRoom).emit('agent-status-changed', {
                    websiteId: socket.websiteId,
                    online: true,
                    timestamp: new Date()
                });
                
                console.log(`Agent connected for website ${socket.websiteId} - notifying visitors`);
            }

            // Set visitor as online when they connect
            if (!socket.isAdmin && socket.visitorId) {
                setVisitorStatus(io, socket.websiteId, socket.visitorId, 'online');
            }

            // Handle visitor messages
            socket.on('visitor-message', (data) => {
                // Update visitor status to online when they send a message
                setVisitorStatus(io, socket.websiteId, socket.visitorId, 'online');
                handleVisitorMessage(io, socket, data);
            });

            // Handle visitor going away
            socket.on('visitor-away', (data) => {
                if (data.websiteId === socket.websiteId && data.visitorId === socket.visitorId) {
                    setVisitorStatus(io, data.websiteId, data.visitorId, 'away');
                    console.log(`Visitor ${data.visitorId} is now away`);
                }
            });

            // Handle admin messages
            socket.on('admin-message', (data) => handleAdminMessage(io, socket, data));
            
            // Handle admin typing events
            socket.on('admin-typing', (data) => {
                if (socket.isAdmin && data.websiteId === socket.websiteId) {
                    // Forward typing event to the specific visitor
                    const visitorRoom = `visitor_${data.visitorId}`;
                    socket.to(visitorRoom).emit('admin-typing', {
                        websiteId: data.websiteId,
                        visitorId: data.visitorId,
                        timestamp: new Date()
                    });
                    
                    // Also emit to website room for broader visibility
                    const websiteRoom = `website_${data.websiteId}`;
                    socket.to(websiteRoom).emit('admin-typing', {
                        websiteId: data.websiteId,
                        visitorId: data.visitorId,
                        timestamp: new Date()
                    });
                    
                    console.log(`Admin typing event forwarded to visitor ${data.visitorId} in website ${data.websiteId}`);
                }
            });
            
            socket.on('admin-stop-typing', (data) => {
                if (socket.isAdmin && data.websiteId === socket.websiteId) {
                    // Forward stop typing event to the specific visitor
                    const visitorRoom = `visitor_${data.visitorId}`;
                    socket.to(visitorRoom).emit('admin-stop-typing', {
                        websiteId: data.websiteId,
                        visitorId: data.visitorId,
                        timestamp: new Date()
                    });
                    
                    // Also emit to website room for broader visibility
                    const websiteRoom = `website_${data.websiteId}`;
                    socket.to(websiteRoom).emit('admin-stop-typing', {
                        websiteId: data.websiteId,
                        visitorId: data.visitorId,
                        timestamp: new Date()
                    });
                    
                    console.log(`Admin stop typing event forwarded to visitor ${data.visitorId} in website ${data.websiteId}`);
                }
            });
            
            // Handle agent status check requests
            socket.on('check-agent-status', (data) => {
                if (data.websiteId === socket.websiteId) {
                    const isOnline = isAnyAdminOnline(io, socket.websiteId);
                    socket.emit('agent-status-changed', {
                        websiteId: socket.websiteId,
                        online: isOnline,
                        timestamp: new Date()
                    });
                }
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            socket.on('disconnect', (reason) => {
                console.log('Client disconnected', socket.id, reason);
                const websiteId = socket.websiteId;
                const wasAdmin = socket.isAdmin;
                const visitorId = socket.visitorId;
                
                socket.leave(`website_${websiteId}`);
                
                if (wasAdmin) {
                    socket.leave(`admin_${websiteId}`);
                    
                    // Check if any other admins are still online for this website
                    // We need to check after a short delay to ensure the socket is fully disconnected
                    setTimeout(() => {
                        const stillHasAdmins = isAnyAdminOnline(io, websiteId);
                        if (!stillHasAdmins) {
                            // No admins online anymore, notify visitors
                            const websiteRoom = `website_${websiteId}`;
                            io.to(websiteRoom).emit('agent-status-changed', {
                                websiteId: websiteId,
                                online: false,
                                timestamp: new Date()
                            });
                            
                            console.log(`All agents disconnected for website ${websiteId} - notifying visitors`);
                        }
                    }, 100);
                } else if (visitorId && !socket.isAdmin) {
                    // Visitor disconnected - set them as away immediately
                    console.log(`Visitor ${visitorId} disconnected, setting as away`);
                    setVisitorStatus(io, websiteId, visitorId, 'away');
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

        // Global cleanup function for server shutdown
        const cleanup = () => {
            console.log('Cleaning up socket server...');
            
            // Clear all visitor status timeouts
            for (const [key, statusData] of visitorStatuses.entries()) {
                if (statusData.timeoutId) {
                    clearTimeout(statusData.timeoutId);
                }
            }
            visitorStatuses.clear();
            
            // Disconnect all sockets
            if (io) {
                io.disconnectSockets(true);
                io.close();
            }
            
            global.io = null;
            console.log('Socket server cleanup completed');
        };
        
        // Store cleanup function globally for external access
        global.socketCleanup = cleanup;
        
        // Handle process termination
        process.on('SIGTERM', cleanup);
        process.on('SIGINT', cleanup);
        
        global.io = io;
        return new Response('Socket is running');
    } catch (error) {
        console.error('Socket initialization error:', error);
        return new Response('Failed to start socket server', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
