'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

const PopupTimingSettings = ({ popup, onPopupChange }) => {
    const { t } = useTranslation();

    const handleChange = (field, value) => {
        onPopupChange({ ...popup, [field]: value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">{t('popupManager.createPopup.timing.title')}</h3>
            <p className="text-muted-foreground">{t('popupManager.createPopup.timing.description')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Delay Settings */}
                <div className="space-y-2">
                    <Label htmlFor="delay" className="text-foreground">
                        {t('popupManager.createPopup.timing.delay.label')}
                    </Label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input id="delay" type="number" min="0" step="100" value={popup.delay} onChange={(e) => handleChange('delay', parseInt(e.target.value) || 0)} className="w-full" />
                        </div>
                        <div className="w-20 text-sm text-muted-foreground">{(popup.delay / 1000).toFixed(1)}s</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('popupManager.createPopup.timing.delay.description')}</p>
                </div>

                {/* Duration Settings */}
                <div className="space-y-2">
                    <Label htmlFor="duration" className="text-foreground">
                        {t('popupManager.createPopup.timing.duration.label')}
                    </Label>
                    <select
                        id="duration"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={popup.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}>
                        <option value="3000">{t('popupManager.createPopup.timing.duration.options.3s')}</option>
                        <option value="5000">{t('popupManager.createPopup.timing.duration.options.5s')}</option>
                        <option value="7000">{t('popupManager.createPopup.timing.duration.options.7s')}</option>
                        <option value="10000">{t('popupManager.createPopup.timing.duration.options.10s')}</option>
                        <option value="unlimited">{t('popupManager.createPopup.timing.duration.options.unlimited')}</option>
                    </select>
                    <p className="text-sm text-muted-foreground">{t('popupManager.createPopup.timing.duration.description')}</p>
                </div>
            </div>
        </div>
    );
};

export default PopupTimingSettings;
