'use client';

import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import React from 'react';

function Header() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const changeLanguage = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        // In Next.js 13+ app directory, we don't need to use the router for language changes
        // The i18next-browser-languagedetector will handle the URL updates
    };

    return (
        <div className="flex justify-between items-center h-12 w-full border-b py-2 shadow-gray-50 shadow px-6">
            {/* Left side */}
            <div>
                <h2 className="text-xl font-semibold">{t('header.adminPanel')}</h2>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-4">
                <select onChange={changeLanguage} value={i18n.language} className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="en">{t('header.languages.en')}</option>
                    <option value="fr">{t('header.languages.fr')}</option>
                </select>
                <UserButton appearance={'primary'} />
            </div>
        </div>
    );
}

export default Header;
