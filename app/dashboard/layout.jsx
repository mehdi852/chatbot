'use client';

import React from 'react';
import Sidebar from './_components/sidebar';
import Header from './_components/header';
import Head from 'next/head';
export default function DashboardLayout({ children }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background">
             <Head>
                <title>Dashboard</title>
                <meta name="description" content="Create, manage, and deploy stunning website popups effortlessly with our  Popup Builder. Centralize your popup campaigns, customize designs, and boost conversions with advanced targeting—all with a single embed code." />
                <meta name="keywords" content="Popup builder SaaS, Website popup creator, Popup management tool, Custom popup designs, Website popups with embed code, Marketing popups software, Popup targeting and triggers, Easy popup integration, Centralized popup manager, Drag-and-drop popup builder, Boost website conversions, Exit intent popups, Popup display rules, SaaS popup solutions, Advanced popup targeting" />
            </Head>
            <Sidebar />
            <div className="flex-1">
                <main className="ml-0 lg:ml-[256px] min-h-[calc(100vh-56px)]">
                    <Header />
                    {children}
                </main>
            </div>
        </div>
    );
}
