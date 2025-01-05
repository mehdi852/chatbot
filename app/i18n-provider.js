'use client';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace) => import(`../public/locales/${language}/${namespace}.json`)))
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr', 'de', 'nl', 'pt', 'bg', 'hr','da','fi','it','nb','sv'],
        defaultNS: 'common',
        fallbackNS: 'common',
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export function I18nProvider({ children }) {
    return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
