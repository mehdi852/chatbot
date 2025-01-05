import { Check } from 'lucide-react';

const steps = [
    { id: 1, name: 'Welcome', status: 'current' },
    { id: 2, name: 'System Check', status: 'upcoming' },
    { id: 3, name: 'Website Settings', status: 'upcoming' },
    { id: 4, name: 'Finish', status: 'upcoming' },
];

export default function InstallationStepper() {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''} flex-1`}>
                        {step.status === 'complete' ? (
                            <div className="group">
                                <span className="flex items-center">
                                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                                </span>
                            </div>
                        ) : step.status === 'current' ? (
                            <div className="flex items-center" aria-current="step">
                                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary">
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                </span>
                                <span className="ml-4 text-sm font-medium text-primary">{step.name}</span>
                            </div>
                        ) : (
                            <div className="group">
                                <div className="flex items-center">
                                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                                        <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-gray-500">{step.name}</span>
                                </div>
                            </div>
                        )}

                        {stepIdx !== steps.length - 1 && <div className={`absolute left-0 right-0 top-4 -mt-0.5 h-0.5 ${step.status === 'complete' ? 'bg-primary' : 'bg-gray-300'}`} />}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
