export const dynamic = 'force-dynamic';

import { db } from '@/configs/db';
import { WidgetSettings, Websites, Users } from '@/configs/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Debug widget settings relationships
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get('websiteId');

        console.log('🔍 DEBUG: Starting debug for websiteId:', websiteId);

        // Get all websites to see what's available
        const allWebsites = await db
            .select()
            .from(Websites)
            .limit(10);
            
        console.log('🔍 DEBUG: All websites in database:', allWebsites);

        // Get all widget settings to see what's available
        const allWidgetSettings = await db
            .select()
            .from(WidgetSettings)
            .limit(10);
            
        console.log('🔍 DEBUG: All widget settings in database:', allWidgetSettings);

        let debugInfo = {
            websiteId: websiteId,
            allWebsites: allWebsites,
            allWidgetSettings: allWidgetSettings
        };

        if (websiteId) {
            // Get specific website
            const website = await db
                .select()
                .from(Websites)
                .where(eq(Websites.id, parseInt(websiteId)))
                .limit(1);
                
            debugInfo.requestedWebsite = website;

            if (website.length > 0) {
                const userId = website[0].user_id;
                debugInfo.userId = userId;

                // Get ALL widget settings for this user (ordered by updated_at)
                const allUserWidgetSettings = await db
                    .select()
                    .from(WidgetSettings)
                    .where(eq(WidgetSettings.user_id, userId))
                    .orderBy(desc(WidgetSettings.updated_at));
                    
                debugInfo.allUserWidgetSettings = allUserWidgetSettings;
                
                // Get the most recent widget settings (what the API should return)
                const mostRecentWidgetSettings = await db
                    .select()
                    .from(WidgetSettings)
                    .where(eq(WidgetSettings.user_id, userId))
                    .orderBy(desc(WidgetSettings.updated_at))
                    .limit(1);
                    
                debugInfo.mostRecentWidgetSettings = mostRecentWidgetSettings;

                // Get user info
                const user = await db
                    .select()
                    .from(Users)
                    .where(eq(Users.id, userId))
                    .limit(1);
                    
                debugInfo.user = user;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            debug: debugInfo
        }, null, 2), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('🔍 DEBUG: Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
