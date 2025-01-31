export async function GET(req) {
    try {
        console.log('Socket server status check');

        const status = {
            isRunning: !!global.io,
            socketCount: global.io ? global.io.sockets.sockets.size : 0,
            timestamp: new Date().toISOString(),
        };

        console.log('Socket server status:', status);

        return new Response(JSON.stringify(status), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error checking socket status:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
