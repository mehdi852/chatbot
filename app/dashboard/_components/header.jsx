'use client';
import { UserButton } from '@clerk/nextjs';
import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import LanguagePicker from '@/components/LanguagePicker';

function Header() {
    const { user } = useUser();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const { t } = useTranslation();

    const checkIfAdmin = async () => {
        try {
            const response = await fetch('/api/check-admin');
            const data = await response.json();
            return data.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    };

    useEffect(() => {
        if (user) {
            checkIfAdmin().then((result) => {
                setIsAdmin(result);
            });
        }
    }, [user]);

    return (
        <div className="flex justify-between items-center h-14 w-full border-b border-border bg-card/80 backdrop-blur-sm py-2 px-4 lg:px-6">
            {/* Left side */}
            <div className=""></div>
            {/* Right side */}
            <div className="flex justify-center items-center gap-4">
                <LanguagePicker />
                <ThemeToggle />
                {isAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = '/admin';
                        }}>
                        Admin
                    </Button>
                )}
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: 'w-8 h-8',
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default Header;
