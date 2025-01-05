export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { Users, UserTickets, TicketMessages } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function GET(req) {
    try {
        // Get authenticated user from Clerk
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
        }

        // Get requested user ID from query params
        const { searchParams } = new URL(req.url);
        const dbUserId = searchParams.get('userId');
        if (!dbUserId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get Clerk user's email
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const clerkUserEmail = clerkUser.emailAddresses[0].emailAddress;
        // revalidatePath('/dashboard/support');
        revalidatePath('/dashboard/settings');
        // Get database user and verify email matches
        const dbUser = await db
            .select()
            .from(Users)  // Changed from UserTickets to Users table
            .where(eq(Users.id, parseInt(dbUserId)))
            .limit(1);

      
        if (!dbUser.length || dbUser[0].email !== clerkUserEmail) {
            return NextResponse.json({ 
                error: 'Unauthorized - You can only access your own tickets',
                debug: {
                    clerkUserEmail,
                    dbUserEmail: dbUser[0]?.email,
                    dbUserId
                }
            }, { status: 403 });
        }

        // Get tickets with their messages
        const tickets = await db
            .select({
                ticket_id: UserTickets.ticket_id,
                user_id: UserTickets.user_id,
                name: UserTickets.name,
                isRead: UserTickets.isRead,
                resolved: UserTickets.resolved,
                created_at: UserTickets.created_at,
                messages: TicketMessages
            })
            .from(UserTickets)
            .leftJoin(TicketMessages, eq(UserTickets.ticket_id, TicketMessages.ticket_id))
            .where(eq(UserTickets.user_id, parseInt(dbUserId)));

        // Group messages by ticket
        const groupedTickets = tickets.reduce((acc, curr) => {
            const ticket = acc.find(t => t.ticket_id === curr.ticket_id);
            if (ticket) {
                if (curr.messages) {
                    ticket.messages.push(curr.messages);
                }
            } else {
                acc.push({
                    ...curr,
                    messages: curr.messages ? [curr.messages] : []
                });
            }
            return acc;
        }, []);


        return NextResponse.json({ tickets: groupedTickets }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error.message 
        }, { status: 500 });
    }
}
