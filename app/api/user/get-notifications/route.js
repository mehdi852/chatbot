import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { Notifications } from '@/configs/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export async function GET(req) {
    try {
        // Get query parameters
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
        const type = url.searchParams.get('type');

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Build query conditions
        let conditions = eq(Notifications.user_id, userId);

        // Add type filter if provided
        if (type && type !== 'all') {
            conditions = and(conditions, eq(Notifications.type, type));
        }

        // Add unread filter if requested
        if (unreadOnly) {
            conditions = and(conditions, eq(Notifications.read, false));
        }

        // Fetch notifications with pagination
        const notifications = await db.select().from(Notifications).where(conditions).orderBy(desc(Notifications.created_at)).limit(limit).offset(offset);

        // Use count() correctly with explicit alias
        const totalCountResult = await db
            .select({ count: sql`count(*)` })
            .from(Notifications)
            .where(eq(Notifications.user_id, userId));

        const unreadCountResult = await db
            .select({ count: sql`count(*)` })
            .from(Notifications)
            .where(and(eq(Notifications.user_id, userId), eq(Notifications.read, false)));

        // Safely extract count values with fallbacks
        const totalCount = totalCountResult[0]?.count ? Number(totalCountResult[0].count) : 0;
        const unreadCount = unreadCountResult[0]?.count ? Number(unreadCountResult[0].count) : 0;

        return NextResponse.json({
            success: true,
            notifications,
            pagination: {
                total: totalCount,
                unreadCount: unreadCount,
                limit,
                offset,
                hasMore: notifications.length === limit,
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications', details: error.message }, { status: 500 });
    }
}

// Route to mark notifications as read
export async function POST(req) {
    try {
        const { userId, notificationId, markAllRead } = await req.json();

        // Validate user ID
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        let updatedNotifications;

        // Mark all notifications as read
        if (markAllRead) {
            updatedNotifications = await db
                .update(Notifications)
                .set({
                    read: true,
                    updated_at: new Date(),
                })
                .where(eq(Notifications.user_id, userId))
                .returning();

            return NextResponse.json({
                success: true,
                message: 'All notifications marked as read',
                count: updatedNotifications.length,
            });
        }

        // Mark a specific notification as read
        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID is required when not marking all as read' }, { status: 400 });
        }

        // Update the specific notification
        updatedNotifications = await db
            .update(Notifications)
            .set({
                read: true,
                updated_at: new Date(),
            })
            .where(and(eq(Notifications.id, notificationId), eq(Notifications.user_id, userId)))
            .returning();

        if (updatedNotifications.length === 0) {
            return NextResponse.json({ error: 'Notification not found or does not belong to the user' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read',
            notification: updatedNotifications[0],
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Failed to update notification', details: error.message }, { status: 500 });
    }
}
