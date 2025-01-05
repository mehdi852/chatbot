import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // List of required environment variables
        const requiredEnvVars = [
            'NEXT_PUBLIC_DRIZZLE_DATABASE_URL', 
            'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
            'CLERK_SECRET_KEY',
            'NEXT_PUBLIC_APP_URL',
            'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
            'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
        ];

        const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        return NextResponse.json({
            success: true,
            message: 'All required environment variables are set',
        });
    } catch (error) {
        console.error('Environment variables check error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Environment variables check failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
