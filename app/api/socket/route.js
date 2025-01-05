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

            socket.on('visitor-message', (data) => {
                console.log('Visitor message received:', data);
                io.emit('admin-receive-message', {
                    message: data.message,
                    websiteId: data.websiteId,
                    visitorId: data.visitorId,
                    timestamp: new Date(),
                });
            });

            socket.on('admin-message', (data) => {
                console.log('Admin message received:', data);
                io.emit('visitor-receive-message', {
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
            });
        });

        global.io = io;
        console.log('Socket server started on port 3001');
        return new Response('Socket is running');
    } catch (err) {
        console.error('Socket initialization error:', err);
        return new Response('Failed to start socket server', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
