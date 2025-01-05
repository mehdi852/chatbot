import { db } from "@/configs/db";
import { CollectedEmails, WebsitePopups, WebsitePaths, Websites } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
    try {
        const { email, popupId, sourceUrl, ipAddress, userAgent } = await req.json();

        if (!email || !popupId) {
            return new Response(JSON.stringify({ error: 'Email and popup ID are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Get popup details using direct query
        const popup = await db
            .select({
                id: WebsitePopups.id,
                pathId: WebsitePopups.path_id,
                path: {
                    id: WebsitePaths.id,
                    websiteId: WebsitePaths.website_id,
                    website: {
                        id: Websites.id,
                        userId: Websites.user_id
                    }
                }
            })
            .from(WebsitePopups)
            .leftJoin(WebsitePaths, eq(WebsitePopups.path_id, WebsitePaths.id))
            .leftJoin(Websites, eq(WebsitePaths.website_id, Websites.id))
            .where(eq(WebsitePopups.id, parseInt(popupId)))
            .execute();


        if (!popup || popup.length === 0) {
            return new Response(JSON.stringify({ error: 'Popup not found' }), { 
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        const popupData = popup[0];

        // Check for existing email
        const existingEmail = await db
            .select()
            .from(CollectedEmails)
            .where(
                and(
                    eq(CollectedEmails.email, email),
                    eq(CollectedEmails.website_id, popupData.path.website.id)
                )
            )
            .execute();

        if (existingEmail && existingEmail.length > 0) {
            return new Response(JSON.stringify({ success: true, message: 'Email already collected' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Prepare the data for insertion
        const emailData = {
            popup_id: parseInt(popupId),
            email: email,
            user_id: popupData.path.website.userId,
            website_id: popupData.path.website.id,
            path_id: popupData.path.id,
            status: 'active',
            source_url: sourceUrl || null,
            ip_address: ipAddress || null,
            user_agent: userAgent || null,
        };


        // Save the email
        const result = await db.insert(CollectedEmails).values(emailData);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });
    } catch (error) {
        console.error('Error in email collection:', error);
        console.error('Error stack:', error.stack);
        return new Response(JSON.stringify({ 
            error: 'Failed to save email',
            details: error.message,
            stack: error.stack 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
} 