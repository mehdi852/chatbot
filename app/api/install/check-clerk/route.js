import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // First check if environment variables are set
        const requiredEnvVars = [
            'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
            'CLERK_SECRET_KEY',
            'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
        ];

        const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required Clerk environment variables: ${missingEnvVars.join(', ')}`);
        }

        // Create a Clerk client instance
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        // Verify Clerk credentials by making an API call
        try {
            // Try to get users list to verify API access
            await clerk.users.getUserList({ limit: 1 });

            return NextResponse.json({
                success: true,
                message: 'Clerk authentication is properly configured',
                details: 'Successfully verified Clerk API access',
            });
        } catch (clerkError) {
            console.error('Clerk API error:', clerkError);
            throw new Error(clerkError.message || 'Failed to verify Clerk API access');
        }
    } catch (error) {
        console.error('Clerk configuration error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Clerk authentication configuration check failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
