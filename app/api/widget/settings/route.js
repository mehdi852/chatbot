export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/configs/db.server';
import { WidgetSettings } from '@/configs/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Default widget settings
const defaultSettings = {
    primaryColor: '#3b82f6',
    buttonSize: 'medium',
    buttonPosition: 'bottom-right',
    welcomeMessage: 'Hi! How can we help you today?',
    placeholderText: 'Type your message...',
    companyName: 'Support Team',
    showBranding: true,
    borderRadius: 'rounded',
    buttonText: 'Chat with us',
    headerColor: '#1e40af',
    textColor: '#374151',
    backgroundColor: '#ffffff',
    brandName: 'BirdSeed',
};

// GET - Load widget settings for a user
export async function GET(request) {
    revalidatePath('/dashboard/widget-customization');

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Query database for existing widget settings (get the most recent one)
        const existingSettings = await db
            .select()
            .from(WidgetSettings)
            .where(eq(WidgetSettings.user_id, parseInt(userId)))
            .orderBy(desc(WidgetSettings.updated_at))
            .limit(1);

        if (existingSettings.length > 0) {
            const settings = existingSettings[0];

            // Convert database format to component format
            const formattedSettings = {
                primaryColor: settings.primary_color,
                headerColor: settings.header_color,
                backgroundColor: settings.background_color,
                textColor: settings.text_color,
                buttonSize: settings.button_size,
                buttonPosition: settings.button_position,
                borderRadius: settings.border_radius,
                welcomeMessage: settings.welcome_message,
                placeholderText: settings.placeholder_text,
                companyName: settings.company_name,
                buttonText: settings.button_text,
                showBranding: settings.show_branding,
                brandName: settings.brand_name,
            };

            return NextResponse.json(
                {
                    success: true,
                    settings: formattedSettings,
                },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        Pragma: 'no-cache',
                    },
                }
            );
        } else {
            // Return default settings if no custom settings exist
            return NextResponse.json(
                {
                    success: true,
                    settings: defaultSettings,
                },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        Pragma: 'no-cache',
                    },
                }
            );
        }
    } catch (error) {
        console.error('Error loading widget settings:', error);
        return NextResponse.json({ error: 'Failed to load widget settings' }, { status: 500 });
    }
}

// POST - Save widget settings for a user
export async function POST(request) {
    revalidatePath('/dashboard/widget-customization');

    try {
        const { userId, settings } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (!settings) {
            return NextResponse.json({ error: 'Settings are required' }, { status: 400 });
        }

        // Validate settings structure
        const requiredFields = [
            'primaryColor',
            'buttonSize',
            'buttonPosition',
            'welcomeMessage',
            'placeholderText',
            'companyName',
            'borderRadius',
            'buttonText',
            'headerColor',
            'textColor',
            'backgroundColor',
            'brandName',
        ];

        for (const field of requiredFields) {
            if (!(field in settings)) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // Check if user already has widget settings
        const existingSettings = await db
            .select()
            .from(WidgetSettings)
            .where(eq(WidgetSettings.user_id, parseInt(userId)))
            .limit(1);

        // Prepare settings for database (convert camelCase to snake_case)
        const dbSettings = {
            user_id: parseInt(userId),
            primary_color: settings.primaryColor,
            header_color: settings.headerColor,
            background_color: settings.backgroundColor,
            text_color: settings.textColor,
            button_size: settings.buttonSize,
            button_position: settings.buttonPosition,
            border_radius: settings.borderRadius,
            welcome_message: settings.welcomeMessage,
            placeholder_text: settings.placeholderText,
            company_name: settings.companyName,
            button_text: settings.buttonText,
            show_branding: settings.showBranding || false,
            brand_name: settings.brandName || 'BirdSeed',
            updated_at: new Date(),
        };

        if (existingSettings.length > 0) {
            // Update existing settings
            await db
                .update(WidgetSettings)
                .set(dbSettings)
                .where(eq(WidgetSettings.user_id, parseInt(userId)));
        } else {
            // Create new settings
            await db.insert(WidgetSettings).values({
                ...dbSettings,
                created_at: new Date(),
            });
        }

        // Clear cache for dashboard and public API
        revalidatePath('/api/public/widget-settings');

        return NextResponse.json(
            {
                success: true,
                message: 'Widget settings saved successfully',
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    Pragma: 'no-cache',
                },
            }
        );
    } catch (error) {
        console.error('Error saving widget settings:', error);
        return NextResponse.json({ error: 'Failed to save widget settings' }, { status: 500 });
    }
}
