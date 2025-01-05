'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router for client-side navigation
import AdminSidebar from './_components/sidebar';
import Header from './_components/header';
import { db } from '@/configs/db';
import { Users } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';

function DashboardLayout({ children }) {
    const { user } = useUser();
    const router = useRouter();



   return (
        <div className="flex">
            <AdminSidebar />
            <div className="w-full h-screen">
                <Header />
                {children}
            </div>
        </div>
    );
}

export default DashboardLayout;
