'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const PopupPreview = ({ popup }) => {
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-[300px] bg-gray-50 rounded-lg border overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px]">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0">
                                {popup.icon && <Image src={popup.icon} alt={t('popupManager.createPopup.preview.iconAlt')} width={40} height={40} className="rounded-lg object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{popup.title || t('popupManager.createPopup.preview.defaultTitle')}</h3>
                                <p className="text-sm text-gray-600 truncate">{popup.message || t('popupManager.createPopup.preview.defaultMessage')}</p>
                            </div>
                        </div>
                        {popup.type === 'email_collector' && (
                            <div className="mt-3 flex gap-2">
                                <input type="text" className="flex-1 text-sm px-3 py-1.5 rounded border" placeholder={popup.placeholder_text} disabled />
                                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">{popup.button_text}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupPreview;
