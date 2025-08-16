import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/configs/db.server';
import { UserTickets } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        // Get authenticated user from Clerk
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const { ticketId, resolved } = await req.json();

        if (!ticketId) {
            return NextResponse.json(
                {
                    error: 'Ticket ID is required',
                },
                { status: 400 }
            );
        }

        // Update the ticket status
        const updatedTicket = await db.update(UserTickets).set({ resolved }).where(eq(UserTickets.ticket_id, ticketId)).returning();

        if (!updatedTicket.length) {
            return NextResponse.json(
                {
                    error: 'Ticket not found or update failed',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Ticket status updated successfully',
                data: updatedTicket[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return NextResponse.json(
            {
                error: 'Failed to update ticket status',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
