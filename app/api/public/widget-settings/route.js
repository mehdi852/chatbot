export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely

import { db } from '@/configs/db';
import { WidgetSettings, Websites } from '@/configs/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

// GET - Load widget settings by website ID (for public fa.js script)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');
        
        if (!websiteId) {
            return new Response(JSON.stringify({ error: 'Website ID is required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // First get the website to find the user_id
        const website = await db
            .select()
            .from(Websites)
            .where(eq(Websites.id, parseInt(websiteId)))
            .limit(1);

        if (website.length === 0) {
            return new Response(JSON.stringify({ error: 'Website not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = website[0].user_id;

        // Get widget settings for this user (prioritize the most recently updated record)
        const existingSettings = await db
            .select()
            .from(WidgetSettings)
            .where(eq(WidgetSettings.user_id, userId))
            .orderBy(desc(WidgetSettings.updated_at))
            .limit(1);

        let settings;

        if (existingSettings.length > 0) {
            const dbSettings = existingSettings[0];
            
            // Convert database format to fa.js format
            settings = {
                primaryColor: dbSettings.primary_color,
                headerColor: dbSettings.header_color,
                backgroundColor: dbSettings.background_color,
                textColor: dbSettings.text_color,
                buttonSize: dbSettings.button_size,
                buttonPosition: dbSettings.button_position,
                borderRadius: dbSettings.border_radius,
                welcomeMessage: dbSettings.welcome_message,
                placeholderText: dbSettings.placeholder_text,
                companyName: dbSettings.company_name,
                buttonText: dbSettings.button_text,
                showBranding: dbSettings.show_branding,
                brandName: dbSettings.brand_name
            };
        } else {
            // Return default settings if no custom settings exist
            settings = {
                primaryColor: '#3b82f6',
                headerColor: '#1e40af',
                backgroundColor: '#ffffff',
                textColor: '#374151',
                buttonSize: 'medium',
                buttonPosition: 'bottom-right',
                borderRadius: 'rounded',
                welcomeMessage: 'Hi! How can we help you today?',
                placeholderText: 'Type your message...',
                companyName: 'Support Team',
                buttonText: 'Chat with us',
                showBranding: true,
                brandName: 'BirdSeed'
            };
        }

        return new Response(JSON.stringify({
            success: true,
            settings: settings
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                // Cache busting headers
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
                'Vary': 'Accept-Encoding'
            }
        });

    } catch (error) {
        console.error('Error loading widget settings for website:', error);
        
        // Return default settings on error
        return new Response(JSON.stringify({
            success: true,
            settings: {
                primaryColor: '#3b82f6',
                headerColor: '#1e40af',
                backgroundColor: '#ffffff',
                textColor: '#374151',
                buttonSize: 'medium',
                buttonPosition: 'bottom-right',
                borderRadius: 'rounded',
                welcomeMessage: 'Hi! How can we help you today?',
                placeholderText: 'Type your message...',
                companyName: 'Support Team',
                buttonText: 'Chat with us',
                showBranding: true,
                brandName: 'BirdSeed'
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }
}
