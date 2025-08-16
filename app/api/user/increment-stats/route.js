import { db } from '@/configs/db.server';
import { Users } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const stat = searchParams.get('stat');

        if (!userId || !stat) {
            return NextResponse.json(
                {
                    error: 'User ID and stat type are required',
                },
                { status: 400 }
            );
        }

        // Validate stat type
        const validStats = ['websites', 'conversations', 'ai_responses'];
        if (!validStats.includes(stat)) {
            return NextResponse.json(
                {
                    error: 'Invalid stat type. Must be one of: websites, conversations, ai_responses',
                },
                { status: 400 }
            );
        }

        // Map stat types to database column names
        const columnMap = {
            websites: 'number_of_websites',
            conversations: 'number_of_conversations',
            ai_responses: 'number_of_ai_responses',
        };

        const columnName = columnMap[stat];

        // Get current user stats
        const user = await db.select().from(Users).where(eq(Users.id, userId)).limit(1);

        if (!user.length) {
            return NextResponse.json(
                {
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        // Increment the specified stat
        const currentValue = user[0][columnName];
        const updateData = {
            [columnName]: currentValue + 1,
        };

        // Update the user's stats
        const updatedUser = await db.update(Users).set(updateData).where(eq(Users.id, userId)).returning();

        return NextResponse.json(
            {
                message: `Successfully incremented ${stat} count`,
                newValue: updatedUser[0][columnName],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error incrementing user stat:', error);
        return NextResponse.json(
            {
                error: 'Failed to increment user stat',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
