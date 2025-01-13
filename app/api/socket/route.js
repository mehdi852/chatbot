import { Server as SocketIOServer } from 'socket.io';
import { db } from '@/configs/db';
import { Websites } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    try {
        if (global.io) {
            return new Response('Socket is already running');
        }

        const io = new SocketIOServer({
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
            allowEIO3: true,
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        io.listen(3001);

        // Middleware to authenticate socket connections
        io.use(async (socket, next) => {
            try {
                const { websiteId, userId } = socket.handshake.query;

                if (!websiteId || !userId) {
                    return next(new Error('Missing required parameters'));
                }

                // Verify website ownership
                const website = await db
                    .select()
                    .from(Websites)
                    .where(eq(Websites.id, parseInt(websiteId)))
                    .limit(1);

                if (!website.length) {
                    return next(new Error('Website not found'));
                }

                // For admin connections, verify website ownership
                if (userId) {
                    if (website[0].user_id !== parseInt(userId)) {
                        return next(new Error('Unauthorized'));
                    }
                    socket.isAdmin = true;
                } else {
                    socket.isAdmin = false;
                }

                socket.websiteId = websiteId;
                socket.userId = userId;
                next();
            } catch (error) {
                return next(new Error('Authentication failed'));
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected', socket.id);

            // Join website-specific room
            const room = `website_${socket.websiteId}`;
            socket.join(room);

            // Create admin-specific room if it's an admin
            if (socket.isAdmin) {
                const adminRoom = `admin_${socket.websiteId}_${socket.userId}`;
                socket.join(adminRoom);
            }

            socket.on('visitor-message', (data) => {
                if (data.websiteId !== socket.websiteId) {
                    console.error('Website ID mismatch');
                    return;
                }

                // Find admin sockets for this website
                const adminSockets = Array.from(io.sockets.sockets.values()).filter((s) => s.isAdmin && s.websiteId === socket.websiteId);

                if (adminSockets.length > 0) {
                    // Send to all admin sockets for this website
                    adminSockets.forEach((adminSocket) => {
                        io.to(adminSocket.id).emit('admin-receive-message', {
                            message: data.message,
                            websiteId: data.websiteId,
                            visitorId: data.visitorId,
                            timestamp: new Date(),
                        });
                    });
                }
            });

            socket.on('admin-message', (data) => {
                if (!socket.isAdmin || data.websiteId !== socket.websiteId) {
                    console.error('Unauthorized admin message');
                    return;
                }

                // Send only to the specific visitor's room
                const visitorRoom = `website_${data.websiteId}`;
                io.to(visitorRoom).emit('visitor-receive-message', {
                    message: data.message,
                    websiteId: data.websiteId,
                    visitorId: data.visitorId,
                    timestamp: new Date(),
                });
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            socket.on('disconnect', (reason) => {
                console.log('Client disconnected', socket.id, reason);
                const room = `website_${socket.websiteId}`;
                socket.leave(room);
                if (socket.isAdmin) {
                    const adminRoom = `admin_${socket.websiteId}_${socket.userId}`;
                    socket.leave(adminRoom);
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
