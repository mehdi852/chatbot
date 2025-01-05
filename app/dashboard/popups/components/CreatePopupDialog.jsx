'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StepIndicator from './StepIndicator';
import PopupTypeSelector from './PopupTypeSelector';
import PopupContentForm from './PopupContentForm';
import PopupTimingSettings from './PopupTimingSettings';
import PopupPreviewStep from './PopupPreviewStep';

const CreatePopupDialog = ({ isOpen, onClose, onCreatePopup, initialPopup }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [popup, setPopup] = useState(initialPopup);

    const handlePopupChange = (newPopup) => {
        setPopup(newPopup);
    };

    const handleClose = () => {
        setCurrentStep(0);
        setPopup(initialPopup);
        onClose();
    };

    const handleCreate = () => {
        onCreatePopup(popup);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] w-full lg:max-w-[1000px] h-[90vh] lg:h-auto overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl lg:text-2xl text-foreground">{t('popupManager.createPopup.title')}</DialogTitle>
                    <p className="text-muted-foreground mt-1">{t('popupManager.createPopup.description')}</p>
                </DialogHeader>

                <div className="mt-6">
                    <StepIndicator
                        currentStep={currentStep}
                        onStepChange={(step) => {
                            if (step < currentStep) {
                                setCurrentStep(step);
                            }
                        }}
                    />

                    <div className="mt-8 space-y-6">
                        {currentStep === 0 && <PopupTypeSelector selectedType={popup.type} onTypeSelect={(type) => handlePopupChange({ ...popup, type })} />}

                        {currentStep === 1 && <PopupContentForm popup={popup} onPopupChange={handlePopupChange} />}

                        {currentStep === 2 && <PopupTimingSettings popup={popup} onPopupChange={handlePopupChange} />}

                        {currentStep === 3 && <PopupPreviewStep popup={popup} onPopupChange={handlePopupChange} />}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between mt-8 pt-4 border-t border-border gap-4 sm:gap-0">
                        <Button variant="outline" onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t('popupManager.createPopup.steps.previous')}
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
                                {t('popupManager.createPopup.steps.cancel')}
                            </Button>

                            {currentStep === 3 ? (
                                <Button onClick={handleCreate} disabled={!popup.title || !popup.message || !popup.icon} className="w-full sm:w-auto">
                                    <Check className="w-4 h-4 mr-2" />
                                    {t('popupManager.createPopup.steps.create')}
                                </Button>
                            ) : (
                                <Button onClick={() => setCurrentStep(currentStep + 1)} className="w-full sm:w-auto">
                                    {t('popupManager.createPopup.steps.next')}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePopupDialog;
