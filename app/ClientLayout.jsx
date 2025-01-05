'use client';

import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import Provider from './provider';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './i18n-provider';
import { MetadataProvider } from './contexts/MetadataContext';

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    // we add also /install to the list of paths that should hide the navbar and footer
    const isHideNavFooter = () => {
        return (
            pathname?.startsWith('/dashboard') ||
            pathname?.startsWith('/admin') ||
            pathname?.startsWith('/demo') ||
            pathname?.startsWith('/sign-in') ||
            pathname?.startsWith('/sign-up') ||
            pathname?.startsWith('/install')
        );
    };

    return (
        <ClerkProvider>
            <Provider>
                <ThemeProvider>
                    <I18nProvider>
                        <MetadataProvider>
                            {!isHideNavFooter() && <Navbar />}
                            <SubscriptionProvider>{children}</SubscriptionProvider>
                            <Toaster />
                            {!isHideNavFooter() && <Footer />}
                        </MetadataProvider>
                    </I18nProvider>
                </ThemeProvider>
            </Provider>
        </ClerkProvider>
    );
}
