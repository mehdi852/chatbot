'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const MetadataContext = createContext();

export function MetadataProvider({ children }) {
    const [metadata, setMetadata] = useState({
        siteTitle: 'My SaaS App',
        siteDescription: 'Welcome to my SaaS application',
        siteKeywords: '',
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch('/api/public/get-general-settings');
                const data = await response.json();
                const settings = data.generalSettings;

                if (settings) {
                    setMetadata({
                        siteTitle: settings.siteTitle || 'My SaaS App',
                        siteDescription: settings.siteDescription || 'Welcome to my SaaS application',
                        siteKeywords: settings.siteKeywords || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };

        fetchMetadata();
    }, []);

    const updateMetadata = (newMetadata) => {
        setMetadata((prev) => ({ ...prev, ...newMetadata }));
    };

    return <MetadataContext.Provider value={{ metadata, updateMetadata }}>{children}</MetadataContext.Provider>;
}

export function useMetadata() {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error('useMetadata must be used within a MetadataProvider');
    }
    return context;
}
