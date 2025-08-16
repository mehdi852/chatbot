import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { Users } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { email, name, imageUrl } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // First, check if this is the first user ever
        const allUsers = await db.select().from(Users);
        const isFirstUser = allUsers.length === 0;

        const result = await db.select().from(Users).where(eq(Users.email, email));

        if (!result[0]) {
            // Create the user with the provided data
            const newUser = await db
                .insert(Users)
                .values({
                    name: name || email.split('@')[0],
                    email: email,
                    imageUrl: imageUrl || 'no-image',
                    role: isFirstUser ? 'admin' : 'user', // Set role to admin if this is the first user
                })
                .returning();

            return NextResponse.json({ isNewUser: true, user: newUser[0] });
        } else {
            return NextResponse.json({ isNewUser: false, user: result[0] });
        }
    } catch (error) {
        console.error('Error in is-new-user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
