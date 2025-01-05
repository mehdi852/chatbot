import { db } from "@/configs/db";
import { CollectedEmails } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req) {
    try {
        const { emailId, userId } = await req.json();

        if (!emailId || !userId) {
            return new Response(JSON.stringify({ error: 'Email ID and User ID are required' }), { 
                status: 400 
            });
        }

        // Delete the email
        await db
            .delete(CollectedEmails)
            .where(
                and(
                    eq(CollectedEmails.id, parseInt(emailId)),
                    eq(CollectedEmails.user_id, parseInt(userId))
                )
            );

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        console.error('Error deleting email:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete email',
            details: error.message 
        }), { 
            status: 500 
        });
    }
} 