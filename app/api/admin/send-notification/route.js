import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { Notifications } from '@/configs/schema';
import { cookies } from 'next/headers';
import { checkIfUserIsAdmin } from '@/utils/authUtils';

export async function POST(req) {
    try {
        const { userId, title, description, type, priority } = await req.json();
        const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

        // Validate required fields
        if (!userId || !title || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!authorized) {
            return NextResponse.json({ error: message }, { status });
        }

        // Insert notification into database
        const notification = await db
            .insert(Notifications)
            .values({
                user_id: userId,
                title,
                description,
                type: type || 'info',
                priority: priority || 'medium',
                read: false,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: 'Notification sent successfully',
                notification: notification[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Failed to send notification', details: error.message }, { status: 500 });
    }
}
