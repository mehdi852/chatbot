import { db } from '@/configs/db'; // Your Drizzle DB config
import { Users } from '@/configs/schema'; // Your database schema
import { eq } from 'drizzle-orm'; // Drizzle ORM for query
import { getAuth } from '@clerk/nextjs/server'; // Clerk's server-side helper for App Router
import { NextResponse } from 'next/server'; // App Router's NextResponse for responses
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkIfUserIsAdmin } from '@/utils/authUtils'; // Import the new utility function
import { getTotalUsers } from '@/utils/AdminUtils'; // Import the new utility function
export async function GET(req) {
    const { authorized, message, isAdmin, status } = await checkIfUserIsAdmin(req);

    

        // Call the utility function to check if the user is an admin

        if (!authorized) {
            return NextResponse.json({ message }, { status });
        }

        // If the user is an admin, return the appropriate response
        return NextResponse.json({ isAdmin }, { status });
    

    }
