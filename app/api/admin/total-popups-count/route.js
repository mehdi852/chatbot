// in here  we well use the schema of the database to get the total number of popups for each user
// using drizzle orm

import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { WebsitePopups } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { sql } from 'drizzle-orm';
import { getTotalPopups } from '@/utils/AdminUtils';

export async function GET(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }

    const { totalPopups } = await getTotalPopups();

    return NextResponse.json({ totalPopups });
}
