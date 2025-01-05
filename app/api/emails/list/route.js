export const dynamic = 'force-dynamic';

import { db } from "@/configs/db";
import { CollectedEmails, WebsitePopups, WebsitePaths, Websites } from "@/configs/schema";
import { eq, sql, or, ilike, and } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '4');
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * perPage;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID is required' }), { 
                status: 400 
            });
        }

        // Base where condition
        let whereConditions = eq(CollectedEmails.user_id, parseInt(userId));

        // Add search condition if search query exists
        if (search) {
            whereConditions = and(
                whereConditions,
                or(
                    ilike(CollectedEmails.email, `%${search}%`),
                    ilike(CollectedEmails.name, `%${search}%`)
                )
            );
        }

        // Get total count with search
        const totalCountResult = await db
            .select({ count: sql`count(*)` })
            .from(CollectedEmails)
            .where(whereConditions);

        const totalCount = totalCountResult[0].count;

        // Get paginated emails with search
        const emails = await db
            .select({
                id: CollectedEmails.id,
                email: CollectedEmails.email,
                name: CollectedEmails.name,
                status: CollectedEmails.status,
                source_url: CollectedEmails.source_url,
                ip_address: CollectedEmails.ip_address,
                user_agent: CollectedEmails.user_agent,
                created_at: CollectedEmails.created_at,
                updated_at: CollectedEmails.updated_at,
                unsubscribed_at: CollectedEmails.unsubscribed_at,
                website_domain: Websites.domain,
                path_name: WebsitePaths.name,
                popup_title: WebsitePopups.title
            })
            .from(CollectedEmails)
            .leftJoin(WebsitePopups, eq(CollectedEmails.popup_id, WebsitePopups.id))
            .leftJoin(WebsitePaths, eq(CollectedEmails.path_id, WebsitePaths.id))
            .leftJoin(Websites, eq(CollectedEmails.website_id, Websites.id))
            .where(whereConditions)
            .orderBy(CollectedEmails.created_at)
            .limit(perPage)
            .offset(offset);

        return new Response(JSON.stringify({
            emails,
            pagination: {
                total: totalCount,
                perPage,
                currentPage: page,
                totalPages: Math.ceil(totalCount / perPage)
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch emails',
            details: error.message 
        }), { 
            status: 500 
        });
    }
} 