// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editUserByEmail, getUserByEmail } from '@/utils/AdminUtils';
import { db } from '@/configs/db';
import { UserTickets, TicketMessages } from '@/configs/schema';
import { gte, desc } from 'drizzle-orm';

export async function POST(req) {
    try {
        // get the name,email,message from the request body

        const { name, email, body } = await req.json();

        const user = await getUserByEmail(email);


        // send the message to the database it should send to multiple tabled since they are connected
        // first will get user id from user.id then insert a row in UsersTickets (user_id, ticket_id, isRead)
        // after that insert into TicketMessages (ticket_id, user_id, subject, body.date)

        try {
            await db.insert(UserTickets).values({
                user_id: user[0].id,
                isRead: false,
                name: user[0].name,
            });

            const ticket = await db.select().from(UserTickets).where(gte(UserTickets.user_id, 1)).orderBy(desc(UserTickets.ticket_id)).limit(1);


            if (!ticket[0]) {
                throw new Error('There is no ticket created for this user');
            }
            await db.insert(TicketMessages).values({
                ticket_id: ticket[0].ticket_id,
                user_id: user[0].id,
                subject: 'No subject',
                body,
                date: new Date(),
            });

        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
