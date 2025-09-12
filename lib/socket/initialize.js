import { Server as SocketIOServer } from 'socket.io';

export async function initializeSocket() {
    const socketMode = process.env.SOCKET_MODE || 'production';
    const port = process.env.SOCKET_PORT || 3001;
    
    console.log(`Creating socket server instance in ${socketMode} mode...`);

    const io = new SocketIOServer({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        allowEIO3: true,
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        // Ensure we're using the default namespace
        path: '/socket.io/',
        serveClient: false,
    });

    io.listen(port);
    console.log(`Socket server listening on port ${port} in ${socketMode} mode`);
    console.log('Socket server configuration:', {
        mode: socketMode,
        port: port,
        cors: io.opts.cors,
        transports: io.opts.transports,
        path: io.opts.path,
    });

    return io;
}
