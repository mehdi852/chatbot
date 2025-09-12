import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const socketMode = process.env.SOCKET_MODE || 'production';
        const socketPort = process.env.SOCKET_PORT || '3001';
        
        return NextResponse.json({
            success: true,
            mode: socketMode,
            port: socketPort,
            isDevelopment: socketMode === 'development'
        });
    } catch (error) {
        console.error('Error getting socket configuration:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get socket configuration' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';