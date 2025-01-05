'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const isValidImageUrl = async (url) => {
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        return contentType.startsWith('image/');
    } catch (error) {
        return false;
    }
};

const PopupContentForm = ({ popup, onPopupChange }) => {
    const { t } = useTranslation();
    const { toast } = useToast();

    const handleChange = (field, value) => {
        onPopupChange({ ...popup, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {/* Icon URL */}
                <div className="space-y-2">
                    <Label htmlFor="iconUrl" className="text-foreground">
                        {t('popupManager.createPopup.content.iconUrl')}
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            id="iconUrl"
                            placeholder={t('popupManager.createPopup.content.iconUrlPlaceholder')}
                            value={popup.icon}
                            onChange={(e) => handleChange('icon', e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={async () => {
                                if (popup.icon) {
                                    const isValid = await isValidImageUrl(popup.icon);
                                    if (!isValid) {
                                        toast({
                                            title: t('popupManager.popup.errors.invalidUrl'),
                                            description: t('popupManager.popup.errors.provideValidUrl'),
                                            variant: 'destructive',
                                        });
                                    } else {
                                        window.open(popup.icon, '_blank');
                                    }
                                }
                            }}>
                            {t('popupManager.popup.preview')}
                        </Button>
                    </div>
                </div>

                {/* Title and Message */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-foreground">
                            {t('popupManager.createPopup.content.title')}
                        </Label>
                        <Input id="title" placeholder={t('popupManager.createPopup.content.titlePlaceholder')} value={popup.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-foreground">
                            {t('popupManager.createPopup.content.message')}
                        </Label>
                        <Input id="message" placeholder={t('popupManager.createPopup.content.messagePlaceholder')} value={popup.message} onChange={(e) => handleChange('message', e.target.value)} />
                    </div>
                </div>

                {/* Type-specific fields */}
                {popup.type === 'advertising' && (
                    <div className="space-y-2">
                        <Label htmlFor="link" className="text-foreground">
                            {t('popupManager.createPopup.content.linkUrl')}
                        </Label>
                        <Input id="link" placeholder={t('popupManager.createPopup.content.linkUrlPlaceholder')} value={popup.link} onChange={(e) => handleChange('link', e.target.value)} />
                        <p className="text-sm text-muted-foreground">{t('popupManager.createPopup.content.linkDescription')}</p>
                    </div>
                )}

                {popup.type === 'email_collector' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="button_text" className="text-foreground">
                                {t('popupManager.createPopup.content.buttonText')}
                            </Label>
                            <Input
                                id="button_text"
                                placeholder={t('popupManager.createPopup.content.buttonTextPlaceholder')}
                                value={popup.button_text}
                                onChange={(e) => handleChange('button_text', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="placeholder_text" className="text-foreground">
                                {t('popupManager.createPopup.content.inputPlaceholder')}
                            </Label>
                            <Input
                                id="placeholder_text"
                                placeholder={t('popupManager.createPopup.content.inputPlaceholderExample')}
                                value={popup.placeholder_text}
                                onChange={(e) => handleChange('placeholder_text', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="success_message" className="text-foreground">
                                {t('popupManager.createPopup.content.successMessage')}
                            </Label>
                            <Input
                                id="success_message"
                                placeholder={t('popupManager.createPopup.content.successMessagePlaceholder')}
                                value={popup.success_message}
                                onChange={(e) => handleChange('success_message', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopupContentForm;
