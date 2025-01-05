
import { db } from '@/configs/db';
import { DashboardStats } from '@/configs/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { checkIfUserIsAdmin } from '@/utils/authUtils'; 
// if only one stat is defined we update the row with the defined stats
// if all stats are defined we update the row with the defined stats
// if no stats are defined we do nothing

export async function POST(req) {
    const { authorized, message, status } = await checkIfUserIsAdmin(req);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { total_websites, total_paths, total_popups } = await req.json();

    try {
        // in here we save only the defined stats
        // if a stat is not defined we don't save it
        const definedStats = {};
        if (total_websites !== undefined) definedStats.total_websites = Number(total_websites);
        if (total_paths !== undefined) definedStats.total_paths = Number(total_paths);
        if (total_popups !== undefined) definedStats.total_popups = Number(total_popups);

        const existingStats = await db.select().from(DashboardStats).where(eq(DashboardStats.id, 1));
        if (existingStats.length > 0) {
            await db.update(DashboardStats).set(definedStats).where(eq(DashboardStats.id, 1));
        } else {
            await db.insert(DashboardStats).values(definedStats);
        }

        return NextResponse.json({ message: 'Dashboard stats updated' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating dashboard stats' }, { status: 500 });
    }
}
