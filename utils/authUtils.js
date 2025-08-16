import { db } from '@/configs/db.server'; // Your Drizzle DB config
import { Users } from '@/configs/schema'; // Your database schema
import { eq } from 'drizzle-orm'; // Drizzle ORM for query
import { getAuth, currentUser } from '@clerk/nextjs/server'; // Clerk server-side helper for authentication

// Utility function to check if the user is an admin
export async function checkIfUserIsAdmin(req) {
    // Get authenticated user data from Clerk
    const { userId } = getAuth(req);

    // Check if the user is authenticated
    if (!userId) {
        return { authorized: false, message: 'Unauthorized', status: 401 };
    }

    //   Fetch the user's email using Clerk server-side helper functions
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
        return { authorized: false, message: 'Email not found', status: 401 };
    }

    // Query the database by the user's email to check if they are an admin
    const result = await db.select().from(Users).where(eq(Users.email, userEmail));

    // Check the role in the database
    if (result.length === 0 || result[0]?.role !== 'admin') {
        return { authorized: false, message: 'Unauthorized', status: 401 };
    }

    // If the user is an admin, return true
    return { authorized: true, isAdmin: true, status: 200 };
}
