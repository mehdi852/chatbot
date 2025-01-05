// app/api/admin/route.js
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { editUserByEmail } from '@/utils/AdminUtils';
import { db } from '@/configs/db';
import { VisitorTicketMessages } from '@/configs/schema';

export async function POST(req) {
    try {
        // get the name,email,message from the request body

        const { name, email, body } = await req.json();

        // send the message to the database, the table is visitors_ticket_messages

        await db.insert(VisitorTicketMessages).values({
            name,
            email,
            body,
            date: new Date(),
            isRead: false,
        });

        return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
