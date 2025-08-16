import { db } from '@/configs/db.server';
import { Websites, WebsitePaths, WebsitePopups, CollectedEmails } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function POST(req) {
    try {
        const { websites, userId } = await req.json();

        if (!userId) {
            return new Response('User ID is required', { status: 400 });
        }

        revalidatePath('/dashboard');

        // Get existing websites for this user
        const existingWebsites = await db.select({ id: Websites.id }).from(Websites).where(eq(Websites.user_id, userId));

        const existingWebsiteIds = existingWebsites.map((w) => w.id);

        // For each website in the incoming data
        for (const website of websites) {
            let websiteId = website.id;
            const websiteExists = existingWebsiteIds.includes(websiteId);

            if (websiteExists) {
                // Update existing website
                await db
                    .update(Websites)
                    .set({
                        domain: website.domain,
                        favicon: website.favicon,
                        color: website.color,
                    })
                    .where(eq(Websites.id, websiteId));
            } else {
                // Create new website
                const [newWebsite] = await db
                    .insert(Websites)
                    .values({
                        id: websiteId,
                        user_id: userId,
                        domain: website.domain,
                        favicon: website.favicon,
                        color: website.color,
                    })
                    .returning({ id: Websites.id });
                websiteId = newWebsite.id;
            }

            // Delete existing paths and popups for this website
            if (websiteExists) {
                const existingPaths = await db.select({ id: WebsitePaths.id }).from(WebsitePaths).where(eq(WebsitePaths.website_id, websiteId));

                for (const path of existingPaths) {
                    // Get all popups for this path
                    const popups = await db.select({ id: WebsitePopups.id }).from(WebsitePopups).where(eq(WebsitePopups.path_id, path.id));

                    // Delete collected emails for each popup
                    for (const popup of popups) {
                        await db.delete(CollectedEmails).where(eq(CollectedEmails.popup_id, popup.id));
                    }

                    // Now safe to delete popups
                    await db.delete(WebsitePopups).where(eq(WebsitePopups.path_id, path.id));
                }

                // Finally delete the paths
                await db.delete(WebsitePaths).where(eq(WebsitePaths.website_id, websiteId));
            }

            // Insert new paths and popups
            for (const path of website.paths || []) {
                const [newPath] = await db
                    .insert(WebsitePaths)
                    .values({
                        id: path.id,
                        website_id: websiteId,
                        name: path.name,
                        path: path.path,
                    })
                    .returning({ id: WebsitePaths.id });

                if (path.popups?.length) {
                    await db.insert(WebsitePopups).values(
                        path.popups.map((popup) => ({
                            id: popup.id,
                            path_id: newPath.id,
                            type: popup.type || 'message',
                            title: popup.title,
                            message: popup.message,
                            icon: popup.icon,
                            timestamp: popup.timestamp,
                            link: popup.link || null,
                            button_text: popup.button_text,
                            placeholder_text: popup.placeholder_text,
                            success_message: popup.success_message,
                            delay: popup.delay || 0,
                            duration: popup.duration || '7000',
                            order: popup.order || 0,
                        }))
                    );
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Save project error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to save project',
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

// Add this new export for handling DELETE requests
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const websiteId = searchParams.get('websiteId');

        if (!websiteId) {
            return new Response('Website ID is required', { status: 400 });
        }

        // Get all paths for this website
        const paths = await db
            .select({ id: WebsitePaths.id })
            .from(WebsitePaths)
            .where(eq(WebsitePaths.website_id, parseInt(websiteId)));

        // For each path, delete associated popups and collected emails
        for (const path of paths) {
            // Get popups for this path
            const popups = await db.select({ id: WebsitePopups.id }).from(WebsitePopups).where(eq(WebsitePopups.path_id, path.id));

            // Delete collected emails for each popup
            for (const popup of popups) {
                await db.delete(CollectedEmails).where(eq(CollectedEmails.popup_id, popup.id));
            }

            // Delete popups
            await db.delete(WebsitePopups).where(eq(WebsitePopups.path_id, path.id));
        }

        // Delete paths
        await db.delete(WebsitePaths).where(eq(WebsitePaths.website_id, parseInt(websiteId)));

        // Finally delete the website
        await db.delete(Websites).where(eq(Websites.id, parseInt(websiteId)));

        revalidatePath('/dashboard');

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Delete website error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to delete website',
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
