'use client';

import React from 'react';
import { Settings2, Palette, Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StepIndicator = ({ currentStep, onStepChange }) => {
    const { t } = useTranslation();

    const steps = [
        {
            label: t('popupManager.createPopup.steps.type.label'),
            icon: Settings2,
            description: t('popupManager.createPopup.steps.type.description'),
        },
        {
            label: t('popupManager.createPopup.steps.content.label'),
            icon: Palette,
            description: t('popupManager.createPopup.steps.content.description'),
        },
        {
            label: t('popupManager.createPopup.steps.timing.label'),
            icon: Clock,
            description: t('popupManager.createPopup.steps.timing.description'),
        },
        {
            label: t('popupManager.createPopup.steps.preview.label'),
            icon: Info,
            description: t('popupManager.createPopup.steps.preview.description'),
        },
    ];

    return (
        <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="relative flex justify-between min-w-[600px] sm:min-w-0">
                <div className="absolute top-4 sm:top-6 left-4 right-4 h-[2px] bg-border -z-10">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{
                            width: `${(currentStep / (steps.length - 1)) * 100}%`,
                            marginLeft: '0',
                        }}
                    />
                </div>

                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;
                    const isPast = index < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center relative z-10 w-32 sm:w-40 px-4">
                            <div
                                className={`w-8 sm:w-12 h-8 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                        : isPast
                                        ? 'bg-accent text-primary hover:bg-accent/80'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                onClick={() => isPast && onStepChange(index)}>
                                <StepIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                            </div>
                            <span className={`mt-2 text-xs sm:text-sm font-medium ${isActive ? 'text-primary' : isPast ? 'text-primary/60' : 'text-muted-foreground'}`}>{step.label}</span>
                            <span className="text-xs text-muted-foreground text-center mt-1 hidden md:block">{step.description}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
