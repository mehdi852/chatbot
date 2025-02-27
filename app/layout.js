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
            <script 
        src="https://chatbot-lac-seven.vercel.app/fa.js" 
        data-website-id="613914" 
        data-api-url="https://chatbot-lac-seven.vercel.app"
        async
    ></script>   
    
    <script 
        src="https://www.vertexit.xyz/fa.js" 
        data-website-id="292429" 
        data-api-url="https://www.vertexit.xyz"
        async
    ></script>
       </head>
            <body className={outfit.className}>
                <ClientLayout>
                    <ThemeProvider>{children}</ThemeProvider>
                </ClientLayout>
            </body>
        </html>
    );
}
