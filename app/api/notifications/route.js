import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { Notifications } from '@/configs/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

// GET - Fetch notifications for a user
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
        const type = url.searchParams.get('type');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        let conditions = eq(Notifications.user_id, userId);

        if (type && type !== 'all') {
            conditions = and(conditions, eq(Notifications.type, type));
        }

        if (unreadOnly) {
            conditions = and(conditions, eq(Notifications.read, false));
        }

        const notifications = await db
            .select()
            .from(Notifications)
            .where(conditions)
            .orderBy(desc(Notifications.created_at))
            .limit(limit)
            .offset(offset);

        const totalCountResult = await db
            .select({ count: sql`count(*)` })
            .from(Notifications)
            .where(eq(Notifications.user_id, userId));

        const unreadCountResult = await db
            .select({ count: sql`count(*)` })
            .from(Notifications)
            .where(and(eq(Notifications.user_id, userId), eq(Notifications.read, false)));

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
        return NextResponse.json({ 
            error: 'Failed to fetch notifications', 
            details: error.message 
        }, { status: 500 });
    }
}

// POST - Create a new notification
export async function POST(req) {
    try {
        const { 
            userId, 
            title, 
            description, 
            type = 'info', 
            priority = 'medium', 
            action_url, 
            sender_name, 
            sender_avatar 
        } = await req.json();

        // Validate required fields
        if (!userId || !title || !description) {
            return NextResponse.json({ 
                error: 'User ID, title, and description are required' 
            }, { status: 400 });
        }

        // Create the notification
        const [newNotification] = await db.insert(Notifications).values({
            user_id: userId,
            title: title,
            description: description,
            type: type,
            priority: priority,
            read: false,
            action_url: action_url || null,
            sender_name: sender_name || null,
            sender_avatar: sender_avatar || null,
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Notification created successfully',
            notification: newNotification,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ 
            error: 'Failed to create notification', 
            details: error.message 
        }, { status: 500 });
    }
}

// PUT - Mark notification(s) as read
export async function PUT(req) {
    try {
        const { userId, notificationId, markAllRead } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        let updatedNotifications;

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

        if (!notificationId) {
            return NextResponse.json({ 
                error: 'Notification ID is required when not marking all as read' 
            }, { status: 400 });
        }

        updatedNotifications = await db
            .update(Notifications)
            .set({
                read: true,
                updated_at: new Date(),
            })
            .where(and(eq(Notifications.id, notificationId), eq(Notifications.user_id, userId)))
            .returning();

        if (updatedNotifications.length === 0) {
            return NextResponse.json({ 
                error: 'Notification not found or does not belong to the user' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read',
            notification: updatedNotifications[0],
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ 
            error: 'Failed to update notification', 
            details: error.message 
        }, { status: 500 });
    }
}
