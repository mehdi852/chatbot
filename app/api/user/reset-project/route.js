import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { 
    Users, 
    CollectedEmails,
    WebsitePopups,
    WebsitePaths,
    Websites
} from '@/configs/schema';

export async function POST(request) {
    const { userId } = await request.json();

    try {
        const user = await db.select().from(Users).where(eq(Users.id, userId));

        if (!user || user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // First, delete collected emails as they reference popups, websites, and paths
        await db.delete(CollectedEmails).where(eq(CollectedEmails.user_id, userId));

        // Get all websites for this user
        const websites = await db.select().from(Websites).where(eq(Websites.user_id, userId));
        
        for (const website of websites) {
            // Get all paths for this website
            const paths = await db.select().from(WebsitePaths)
                .where(eq(WebsitePaths.website_id, website.id));
            
            for (const path of paths) {
                // Delete popups associated with each path
                await db.delete(WebsitePopups)
                    .where(eq(WebsitePopups.path_id, path.id));
            }
            
            // Delete paths associated with the website
            await db.delete(WebsitePaths)
                .where(eq(WebsitePaths.website_id, website.id));
        }

        // Finally, delete the websites
        await db.delete(Websites).where(eq(Websites.user_id, userId));

        return NextResponse.json({ message: 'Project reset successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error resetting project:', error);
        return NextResponse.json({ error: 'Failed to reset project' }, { status: 500 });
    }
}
