import { NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/configs/db.server';
import { TicketMessages, Users } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        // Get authenticated user from Clerk
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const { ticketId, message } = await req.json();

        if (!ticketId || !message) {
            return NextResponse.json(
                {
                    error: 'Ticket ID and message are required',
                },
                { status: 400 }
            );
        }

        // Get the user's database ID using their Clerk email
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const userEmail = clerkUser.emailAddresses[0].emailAddress;

        // Find the user in your database
        const dbUser = await db.select().from(Users).where(eq(Users.email, userEmail)).limit(1);

        if (!dbUser.length) {
            return NextResponse.json(
                {
                    error: 'User not found in database',
                },
                { status: 404 }
            );
        }

        const userId = dbUser[0].id;

        // Insert new message
        const newMessage = await db
            .insert(TicketMessages)
            .values({
                ticket_id: parseInt(ticketId),
                user_id: userId, // Use the database user ID
                subject: 'Reply', // Default subject for replies
                body: message,
                isAdmin: false, // User message, not admin
            })
            .returning();

        return NextResponse.json(
            {
                message: 'Message sent successfully',
                data: newMessage[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {
                error: 'Failed to send message',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
