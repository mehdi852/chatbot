import { Server as SocketIOServer } from 'socket.io';

export async function initializeSocket() {
    console.log('Creating new socket server instance...');

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
    console.log('Socket server listening on port 3001');

    return io;
}
