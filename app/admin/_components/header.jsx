'use client';

import { UserButton } from '@clerk/nextjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguagePicker from '@/components/LanguagePicker';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function Header() {
    const { t } = useTranslation();

    return (
        <div className="flex justify-between h-12 w-full border-b border-border bg-background py-2 px-6">
            {/* Left side */}
            <div>
                <h2 className="text-xl font-semibold text-foreground">{t('header.adminPanel')}</h2>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-4">
                <LanguagePicker />
                <ThemeToggle />
                <UserButton appearance={'primary'} />
            </div>
        </div>
    );
}

export default Header;
