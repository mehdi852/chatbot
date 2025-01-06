import { Server as SocketIOServer } from 'socket.io';

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

        io.on('connection', (socket) => {
            console.log('Client connected', socket.id);

            // Get websiteId from connection query
            const { websiteId, userId } = socket.handshake.query;
            console.log('Connection query:', { websiteId, userId });

            if (websiteId) {
                // Join a room specific to this website
                const room = `website_${websiteId}`;
                socket.join(room);
                console.log(`Client joined room: ${room}`);
                // Log all rooms this socket is in
                console.log('Socket rooms:', socket.rooms);
            }

            socket.on('visitor-message', (data) => {
                console.log('Visitor message received:', data);
                const room = `website_${data.websiteId}`;
                console.log(`Broadcasting to room: ${room}`);
                // Emit only to the first admin client in the room
                const roomSockets = io.sockets.adapter.rooms.get(room);
                if (roomSockets) {
                    const adminSocket = Array.from(roomSockets).find((socketId) => {
                        const socket = io.sockets.sockets.get(socketId);
                        return socket.handshake.query.userId; // Admin sockets have userId in query
                    });
                    if (adminSocket) {
                        io.to(adminSocket).emit('admin-receive-message', {
                            message: data.message,
                            websiteId: data.websiteId,
                            visitorId: data.visitorId,
                            timestamp: new Date(),
                        });
                    } else {
                        // If no admin socket found, broadcast to room as fallback
                        io.to(room).emit('admin-receive-message', {
                            message: data.message,
                            websiteId: data.websiteId,
                            visitorId: data.visitorId,
                            timestamp: new Date(),
                        });
                    }
                }
            });

            socket.on('admin-message', (data) => {
                console.log('Admin message received:', data);
                // Emit only to the specific website room
                io.to(`website_${data.websiteId}`).emit('visitor-receive-message', {
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
                if (websiteId) {
                    socket.leave(`website_${websiteId}`);
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
