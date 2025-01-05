'use client';

import React from 'react';
import { MessageSquare, Mail, Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const PopupTypeSelector = ({ selectedType, onTypeSelect }) => {
    const { t } = useTranslation();

    const types = [
        {
            type: 'message',
            icon: MessageSquare,
            title: t('popupManager.createPopup.types.message.title'),
            description: t('popupManager.createPopup.types.message.description'),
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            type: 'email_collector',
            icon: Mail,
            title: t('popupManager.createPopup.types.email.title'),
            description: t('popupManager.createPopup.types.email.description'),
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            type: 'advertising',
            icon: Megaphone,
            title: t('popupManager.createPopup.types.advertising.title'),
            description: t('popupManager.createPopup.types.advertising.description'),
            iconColor: 'text-pink-600 dark:text-pink-400',
        },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">{t('popupManager.createPopup.types.title')}</h3>
            <p className="text-muted-foreground">{t('popupManager.createPopup.types.description')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map((type) => {
                    const Icon = type.icon;
                    return (
                        <Card key={type.type} className={`cursor-pointer transition-all ${selectedType === type.type ? 'ring-2 ring-primary' : ''}`} onClick={() => onTypeSelect(type.type)}>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Icon className={`w-8 h-8 mx-auto mb-2 ${type.iconColor}`} />
                                    <h3 className="font-medium text-foreground">{type.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default PopupTypeSelector;
