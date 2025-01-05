/**
 * Admin Dashboard Layout Component
 *
 * This component serves as the layout wrapper for all admin pages.
 * It handles authentication and authorization for admin access.
 *
 * Features:
 * - Checks if current user has admin role
 * - Redirects non-admin users to homepage
 * - Provides consistent layout with sidebar and header
 * - Client-side rendered ('use client')
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js router for client-side navigation
import AdminSidebar from '../admin/_components/sidebar';
import Header from './_components/header';
import { useUser } from '@clerk/nextjs';

function DashboardLayout({ children }) {
    // Get current user and router instance
    const { user } = useUser();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = React.useState(false);

    // Check admin status when component mounts or user changes
    useEffect(() => {
        const checkIfAdmin = async () => {
            try {
                const response = await fetch('/api/public/check-user-admin');
                const data = await response.json();
                if (!data.isAdmin) {
                    router.push('/');
                } else {
                    setIsAdmin(true);
                }
            } catch (error) {
                router.push('/homepage'); // Redirect to homepage on error
            }
        };

        // Only run check if user exists
        if (user) {
            checkIfAdmin();
        }
    }, [user, router]);

    // Only render admin layout if user is confirmed admin
    return isAdmin ? (
        <div className="flex bg-background text-foreground">
            <AdminSidebar />
            <div className="w-full h-screen bg-background">
                <Header />
                {children}
            </div>
        </div>
    ) : (
        ''
    );
}

export default DashboardLayout;
