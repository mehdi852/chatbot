export const dynamic = 'force-dynamic';


import { db } from '@/configs/db';
import { Websites, WebsitePaths, WebsitePopups } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function GET(req) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/popups');
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response('User ID is required', { status: 400 });
        }

        // Get all websites for the user
        const websites = await db
            .select()
            .from(Websites)
            .where(eq(Websites.user_id, parseInt(userId)));

        // For each website, get its paths and popups
        const websitesWithData = await Promise.all(
            websites.map(async (website) => {
                const paths = await db
                    .select()
                    .from(WebsitePaths)
                    .where(eq(WebsitePaths.website_id, website.id));

                const pathsWithPopups = await Promise.all(
                    paths.map(async (path) => {
                        const popups = await db
                            .select({
                                id: WebsitePopups.id,
                                type: WebsitePopups.type,
                                title: WebsitePopups.title,
                                message: WebsitePopups.message,
                                icon: WebsitePopups.icon,
                                timestamp: WebsitePopups.timestamp,
                                link: WebsitePopups.link,
                            })
                            .from(WebsitePopups)
                            .where(eq(WebsitePopups.path_id, path.id));

                        return {
                            id: path.id,
                            name: path.name,
                            path: path.path,
                            popups: popups.map((popup) => ({
                                id: popup.id,
                                type: popup.type || 'message',
                                title: popup.title,
                                message: popup.message,
                                icon: popup.icon,
                                timestamp: popup.timestamp,
                                link: popup.link,
                            })),
                        };
                    })
                );

                return {
                    id: website.id,
                    domain: website.domain,
                    favicon: website.favicon,
                    color: website.color,
                    paths: pathsWithPopups,
                };
            })
        );


        return new Response(JSON.stringify(websitesWithData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Get project error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to get project',
                details: error.message,
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
