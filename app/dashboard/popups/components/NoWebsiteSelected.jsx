'use client';

import React from 'react';
import { MessageSquare, Mail, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NoWebsiteSelected = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: MessageSquare,
            title: t('popupManager.noWebsiteSelected.features.messages.title'),
            description: t('popupManager.noWebsiteSelected.features.messages.description'),
            color: 'blue',
        },
        {
            icon: Mail,
            title: t('popupManager.noWebsiteSelected.features.email.title'),
            description: t('popupManager.noWebsiteSelected.features.email.description'),
            color: 'green',
        },
        {
            icon: Megaphone,
            title: t('popupManager.noWebsiteSelected.features.ads.title'),
            description: t('popupManager.noWebsiteSelected.features.ads.description'),
            color: 'pink',
        },
    ];

    return (
        <div className="bg-card rounded-xl border border-border p-4 sm:p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="max-w-2xl mx-auto">
                <div className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg inline-block mb-6 sm:mb-8">{t('popupManager.noWebsiteSelected.title')}</div>

                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('popupManager.noWebsiteSelected.heading')}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm">{t('popupManager.noWebsiteSelected.description')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6 sm:mt-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-accent/50 p-4 sm:p-6 rounded-xl border border-border hover:border-border/60 transition-colors">
                                <div className={`w-8 sm:w-10 h-8 sm:h-10 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                                    <feature.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${feature.color}-500`} />
                                </div>
                                <h3 className="font-medium text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoWebsiteSelected;
