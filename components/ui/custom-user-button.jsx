'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import { useChatContext } from '@/app/contexts/ChatContext';
import { useEffect, useRef } from 'react';

export function CustomUserButton({ afterSignOutUrl = '/', ...props }) {
    const { logout } = useChatContext();
    const { isSignedIn } = useUser();
    const wasSignedIn = useRef(isSignedIn);
    const isCleaningUp = useRef(false);

    // Monitor sign-in state changes to detect logout
    useEffect(() => {
        // If user was signed in but now isn't, they logged out
        if (wasSignedIn.current && !isSignedIn && !isCleaningUp.current) {
            isCleaningUp.current = true;
            
            // Perform cleanup when logout is detected
            const performCleanup = async () => {
                try {
                    console.log('Logout detected - cleaning up sockets...');
                    
                    // Cleanup chat sockets via context
                    if (typeof logout === 'function') {
                        logout();
                        console.log('Local chat sockets cleaned up');
                    }
                    
                    // Call the logout API to disconnect admin sockets
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    console.log('Server admin sockets disconnected');
                } catch (error) {
                    console.error('Error during socket cleanup:', error);
                } finally {
                    isCleaningUp.current = false;
                }
            };
            
            performCleanup();
        }
        
        wasSignedIn.current = isSignedIn;
    }, [isSignedIn, logout]);

    // Cleanup on page unload as additional fallback
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (typeof logout === 'function') {
                logout();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [logout]);

    return (
        <UserButton 
            {...props}
            afterSignOutUrl={afterSignOutUrl}
            appearance={{
                elements: {
                    avatarBox: 'w-8 h-8',
                    ...props.appearance?.elements
                },
                ...props.appearance
            }}
        />
    );
}
