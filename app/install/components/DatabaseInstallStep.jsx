import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Database, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const INSTALL_STEPS = [
    { id: 1, message: 'Checking database status' },
    { id: 2, message: 'Preparing database schema' },
    { id: 3, message: 'Creating user management tables' },
    { id: 4, message: 'Creating subscription tables' },
    { id: 5, message: 'Creating website and popup tables' },
    { id: 6, message: 'Creating support and settings tables' },
    { id: 7, message: 'Optimizing database configuration' },
    { id: 8, message: 'Finalizing installation' },
];

export default function DatabaseInstallStep({ onNext }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

    useEffect(() => {
        const checkDatabaseStatus = async () => {
            try {
                setCurrentStep(0);
                const response = await fetch('/api/install/check-database-status');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to check database status');
                }

                if (data.isInstalled) {
                    // Database is already installed and populated
                    setIsAlreadyInstalled(true);
                    setIsCompleted(true);
                    setProgress(100);
                    return true;
                }

                return false;
            } catch (error) {
                console.error('Error checking database status:', error);
                setError(error.message);
                return false;
            }
        };

        const performInstallation = async () => {
            try {
                // Check database status first
                const isInstalled = await checkDatabaseStatus();
                if (isInstalled) return;

                // If not installed, proceed with installation
                setProgress(15);

                // Create tables
                setCurrentStep(1);
                const response = await fetch('/api/install/create-tables', {
                    method: 'POST',
                });
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to create database tables');
                }

                // Simulate remaining steps with visual feedback
                for (let i = 2; i < INSTALL_STEPS.length; i++) {
                    setCurrentStep(i);
                    await new Promise((resolve) => setTimeout(resolve, 800));
                    setProgress((i + 1) * (100 / INSTALL_STEPS.length));
                }

                setIsCompleted(true);
                setProgress(100);
            } catch (err) {
                console.error('Installation error:', err);
                setError(err.message);
            }
        };

        performInstallation();
    }, []);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Database Installation</h2>
                <p className="text-gray-500 mt-2">{isAlreadyInstalled ? 'Database is already installed and configured' : 'Setting up your database. This may take a few moments.'}</p>
            </div>

            <Card className="p-8 shadow-lg border-gray-200">
                <div className="space-y-6">
                    {/* Progress bar */}
                    <div className="relative pt-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-2 text-sm text-gray-600 text-right">{Math.round(progress)}%</div>
                    </div>

                    {/* Current action */}
                    <div className="flex items-center justify-center gap-4 h-20">
                        {error ? (
                            <div className="flex items-center gap-3 text-red-600">
                                <Database className="h-5 w-5" />
                                <span className="text-lg">Installation failed: {error}</span>
                            </div>
                        ) : !isCompleted ? (
                            <div className="flex items-center gap-3 text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-lg">{INSTALL_STEPS[currentStep]?.message}...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-lg">{isAlreadyInstalled ? 'Database is already installed and configured!' : 'Database installation completed!'}</span>
                            </div>
                        )}
                    </div>

                    {/* Installation steps list */}
                    {!isAlreadyInstalled && (
                        <div className="space-y-3">
                            {INSTALL_STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                            error && index >= currentStep
                                                ? 'bg-red-100 text-red-600'
                                                : index < currentStep
                                                ? 'bg-green-100 text-green-600'
                                                : index === currentStep
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span
                                        className={error && index >= currentStep ? 'text-red-600' : index < currentStep ? 'text-green-600' : index === currentStep ? 'text-blue-600' : 'text-gray-400'}>
                                        {step.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex justify-end pt-6">
                <Button onClick={onNext} disabled={!isCompleted || error} className="gap-2 bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
