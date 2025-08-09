'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/app/contexts/ChatContext';

export default function LogoutPage() {
    const router = useRouter();
    const { logout } = useChatContext();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // Cleanup chat sockets locally
                logout();
                
                // Call the logout API to disconnect admin sockets
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('Admin sockets disconnected');
            } catch (error) {
                console.error('Error during logout:', error);
            } finally {
                // Redirect to sign-out page
                router.push('/sign-in');
            }
        };

        handleLogout();
    }, [router, logout]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Logging out...</p>
            </div>
        </div>
    );
}
