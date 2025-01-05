import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const initialServices = [
    {
        name: 'Database Connection',
        status: 'checking',
        endpoint: '/api/install/check-database',
        description: 'Checking connection to Neon database',
    },
    {
        name: 'Database Permissions',
        status: 'checking',
        endpoint: '/api/install/check-database-permissions',
        description: 'Verifying database permissions',
    },
    {
        name: 'Clerk Authentication',
        status: 'checking',
        endpoint: '/api/install/check-clerk',
        description: 'Checking Clerk authentication setup',
    },
    {
        name: 'Environment Variables',
        status: 'checking',
        endpoint: '/api/install/check-env',
        description: 'Verifying required environment variables',
    },
];

const StatusIcon = ({ status }) => {
    if (status === 'checking') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (status === 'success') return <Check className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <X className="h-5 w-5 text-red-500" />;
};

export default function SystemCheckStep({ onNext, onBack }) {
    const [services, setServices] = useState(initialServices);
    const [isChecking, setIsChecking] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const checkService = async (service, index) => {
            try {
                const response = await fetch(service.endpoint);
                const data = await response.json();

                setServices((prev) => {
                    const newServices = [...prev];
                    newServices[index] = {
                        ...service,
                        status: data.success ? 'success' : 'error',
                        message: data.message,
                        details: data.details,
                        error: data.error,
                    };
                    return newServices;
                });

                if (!data.success) {
                    setErrors((prev) => ({
                        ...prev,
                        [service.name]: data.error,
                    }));
                }

                return data.success; // Return the success status
            } catch (error) {
                console.error(`Error checking ${service.name}:`, error);
                setServices((prev) => {
                    const newServices = [...prev];
                    newServices[index] = {
                        ...service,
                        status: 'error',
                        message: 'Connection failed',
                        error: error.message,
                    };
                    return newServices;
                });
                setErrors((prev) => ({
                    ...prev,
                    [service.name]: error.message,
                }));
                return false; // Return false on error
            }
        };

        const checkAllServices = async () => {
            // Check database connection first
            const dbConnectionSuccess = await checkService(services[0], 0);

            // If database connection succeeds, check permissions next
            if (dbConnectionSuccess) {
                await checkService(services[1], 1); // Check database permissions

                // Then check remaining services in parallel
                const remainingChecks = services.slice(2).map((service, index) => checkService(service, index + 2));
                await Promise.all(remainingChecks);
            } else {
                // If database connection fails, mark permissions check as failed
                setServices((prev) => {
                    const newServices = [...prev];
                    newServices[1] = {
                        ...newServices[1],
                        status: 'error',
                        message: 'Skipped - Database connection required',
                        error: 'Database connection must be established first',
                    };
                    return newServices;
                });

                // Continue with other checks
                const remainingChecks = services.slice(2).map((service, index) => checkService(service, index + 2));
                await Promise.all(remainingChecks);
            }
            setIsChecking(false);
        };

        checkAllServices();
    }, []);

    const allChecksSuccessful = services.every((service) => service.status === 'success');
    const hasErrors = services.some((service) => service.status === 'error');

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">System Check</h2>
                <p className="text-gray-500 mt-2">Verifying your system configuration and services</p>
            </div>

            <div className="space-y-3">
                {services.map((service, index) => (
                    <div
                        key={service.name}
                        className={cn('flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md', {
                            'animate-pulse': service.status === 'checking',
                            'border-green-200 bg-green-50': service.status === 'success',
                            'border-red-200 bg-red-50': service.status === 'error',
                        })}
                        style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50">
                                <StatusIcon status={service.status} />
                            </div>
                            <div>
                                <span className="font-medium text-gray-900">{service.name}</span>
                                <p className="text-sm text-gray-500">
                                    {service.status === 'checking' && service.description}
                                    {service.status === 'success' && (
                                        <>
                                            {service.message}
                                            {service.details && <span className="text-green-600 block mt-1">{service.details}</span>}
                                        </>
                                    )}
                                    {service.status === 'error' && (
                                        <span className="text-red-500">
                                            {service.message}
                                            {service.error && <span className="block mt-1">Error: {service.error}</span>}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasErrors && !isChecking && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-2 items-center text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-medium">System Check Failed</h3>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">Please resolve the following before continuing:</p>
                    <ul className="list-disc list-inside text-yellow-700 text-sm mt-1">
                        {Object.entries(errors).map(([service, error]) => (
                            <li key={service}>
                                <strong>{service}</strong>: {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t">
                <Button variant="outline" onClick={onBack} className="hover:bg-gray-100 transition-colors">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!allChecksSuccessful || isChecking}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
