import { db } from '@/configs/db.server';
import { Websites, WebsitePaths, WebsitePopups } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Helper function to handle CORS
function setCorsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': '*', // Allow all origins for now
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
    };
}

export async function GET(req, { params }) {
    // Add CORS headers to all responses
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: setCorsHeaders(),
        });
    }

    try {
        const corsHeaders = setCorsHeaders();
        const { websiteId } = params;
        const { searchParams } = new URL(req.url);
        const currentPath = searchParams.get('path') || '/';

        if (!websiteId) {
            return new NextResponse('Website ID is required', {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        // First verify the website exists
        const website = await db
            .select()
            .from(Websites)
            .where(eq(Websites.id, parseInt(websiteId)))
            .limit(1);

        if (!website.length) {
            return new NextResponse(JSON.stringify({ error: 'Website not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        // Find the matching path and its popups
        const path = await db
            .select()
            .from(WebsitePaths)
            .where(and(eq(WebsitePaths.website_id, parseInt(websiteId)), eq(WebsitePaths.path, currentPath)))
            .limit(1);

        if (!path.length) {
            return new NextResponse(
                JSON.stringify({
                    popups: [],
                    website: {
                        domain: website[0].domain,
                        favicon: website[0].favicon,
                    },
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                }
            );
        }

        // Get popups for this path
        const popups = await db
            .select({
                id: WebsitePopups.id,
                type: WebsitePopups.type,
                title: WebsitePopups.title,
                message: WebsitePopups.message,
                icon: WebsitePopups.icon,
                timestamp: WebsitePopups.timestamp,
                link: WebsitePopups.link,
                button_text: WebsitePopups.button_text,
                placeholder_text: WebsitePopups.placeholder_text,
                success_message: WebsitePopups.success_message,
                delay: WebsitePopups.delay,
                duration: WebsitePopups.duration,
            })
            .from(WebsitePopups)
            .where(eq(WebsitePopups.path_id, path[0].id));

        return new NextResponse(
            JSON.stringify({
                popups,
                website: {
                    domain: website[0].domain,
                    favicon: website[0].favicon,
                },
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        );
        // gekki
    } catch (error) {
        console.error('Get popups error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to get popups',
                details: error.message,
                stack: error.stack,
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        );
    }
}

// Handle preflight requests
export async function OPTIONS(req) {
    return new NextResponse(null, {
        status: 200,
        headers: setCorsHeaders(),
    });
}
