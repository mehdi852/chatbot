'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './_components/sidebar';
import Header from './_components/header';
import { useUser } from '@clerk/nextjs';

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
