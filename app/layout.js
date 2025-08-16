import localFont from 'next/font/local';
import './globals.css';
import { Outfit } from 'next/font/google';
import ClientLayout from './ClientLayout';
import { getGeneralSettings } from '@/utils/AdminUtils';
import Script from 'next/script';
import { ThemeProvider } from './contexts/ThemeContext';
const outfit = Outfit({
    subsets: ['latin'],
});

export async function generateMetadata() {
    try {
        const generalSettings = await getGeneralSettings();

        return {
            title: generalSettings?.siteTitle || 'My SaaS App',
            description: generalSettings?.siteDescription || 'Welcome to my SaaS application',
            keywords: generalSettings?.siteKeywords || '',
            metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
        };
    } catch (error) {
        console.error('Error fetching metadata:', error);
        // Fallback metadata if there's an error
        return {
            title: 'My SaaS App',
            description: 'Welcome to my SaaS application',
            metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
        };
    }
}

export default async function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script src="http://localhost:3000/fa.js" data-website-id="256646" data-api-url="http://localhost:3000" async></script>
            </head>
            <body className={outfit.className}>
                <ClientLayout>
                    <ThemeProvider>{children}</ThemeProvider>
                </ClientLayout>
            </body>
        </html>
    );
}
