import { getAuth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        let userId = null;
        
        // Try to get userId from auth
        try {
            const auth = getAuth(req);
            userId = auth.userId;
        } catch (authError) {
            console.log('Auth error (expected during logout):', authError.message);
        }
        
        // If no userId, try to get from current user
        if (!userId) {
            try {
                const user = await currentUser();
                userId = user?.id;
            } catch (userError) {
                console.log('Current user error (expected during logout):', userError.message);
            }
        }

        // Disconnect admin sockets for this user
        if (global.io) {
            const sockets = Array.from(global.io.sockets.sockets.values());
            let adminSockets = [];
            
            if (userId) {
                // If we have userId, disconnect sockets for this specific user
                adminSockets = sockets.filter(socket => 
                    socket.isAdmin && 
                    socket.userId && 
                    parseInt(socket.userId) === parseInt(userId)
                );
                console.log(`Disconnecting ${adminSockets.length} admin sockets for user ${userId}`);
            } else {
                // If no userId, try to find stale admin sockets (as a fallback)
                adminSockets = sockets.filter(socket => 
                    socket.isAdmin && 
                    (!socket.connected || socket.disconnected)
                );
                console.log(`Disconnecting ${adminSockets.length} stale admin sockets (no user ID available)`);
            }
            
            adminSockets.forEach(socket => {
                console.log(`Disconnecting admin socket ${socket.id}`);
                socket.disconnect(true);
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({ error: 'Logout failed' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const dynamic = 'force-dynamic';
