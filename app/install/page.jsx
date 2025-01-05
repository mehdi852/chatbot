'use client';

import { Card } from '@/components/ui/card';
import { useState } from 'react';
import WelcomeStep from './components/WelcomeStep';
import SystemCheckStep from './components/SystemCheckStep';
import DatabaseInstallStep from './components/DatabaseInstallStep';
import MetadataStep from './components/MetadataStep';
import FinishStep from './components/FinishStep';

const STEPS = {
    WELCOME: 'welcome',
    SYSTEM_CHECK: 'system_check',
    DATABASE_INSTALL: 'database_install',
    METADATA: 'metadata',
    FINISH: 'finish',
};

export default function InstallPage() {
    const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);

    const handleNext = () => {
        switch (currentStep) {
            case STEPS.WELCOME:
                setCurrentStep(STEPS.SYSTEM_CHECK);
                break;
            case STEPS.SYSTEM_CHECK:
                setCurrentStep(STEPS.DATABASE_INSTALL);
                break;
            case STEPS.DATABASE_INSTALL:
                setCurrentStep(STEPS.METADATA);
                break;
            case STEPS.METADATA:
                setCurrentStep(STEPS.FINISH);
                break;
            default:
                break;
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case STEPS.SYSTEM_CHECK:
                setCurrentStep(STEPS.WELCOME);
                break;
            case STEPS.DATABASE_INSTALL:
                setCurrentStep(STEPS.SYSTEM_CHECK);
                break;
            case STEPS.METADATA:
                setCurrentStep(STEPS.DATABASE_INSTALL);
                break;
            case STEPS.FINISH:
                setCurrentStep(STEPS.METADATA);
                break;
            default:
                break;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case STEPS.WELCOME:
                return <WelcomeStep onNext={handleNext} />;
            case STEPS.SYSTEM_CHECK:
                return <SystemCheckStep onNext={handleNext} onBack={handleBack} />;
            case STEPS.DATABASE_INSTALL:
                return <DatabaseInstallStep onNext={handleNext} />;
            case STEPS.METADATA:
                return <MetadataStep onNext={handleNext} onBack={handleBack} />;
            case STEPS.FINISH:
                return <FinishStep />;
            default:
                return null;
        }
    };

    const getStepNumber = () => {
        switch (currentStep) {
            case STEPS.WELCOME:
                return 1;
            case STEPS.SYSTEM_CHECK:
                return 2;
            case STEPS.DATABASE_INSTALL:
                return 3;
            case STEPS.METADATA:
                return 4;
            case STEPS.FINISH:
                return 5;
            default:
                return 1;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <Card className="w-full max-w-4xl p-8 space-y-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Installation Wizard</h1>
                    <p className="text-gray-500">Follow the steps to set up your application</p>
                </div>

                {/* Progress bar */}
                <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${(getStepNumber() / 5) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600">Step {getStepNumber()} of 5</span>
                        <span className="text-sm text-gray-600">{Math.round((getStepNumber() / 5) * 100)}%</span>
                    </div>
                </div>

                {/* Step content */}
                <div className="mt-8">{renderStep()}</div>
            </Card>
        </div>
    );
}
