import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Rocket } from 'lucide-react';

export default function WelcomeStep({ onNext }) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-4">
                        <Rocket className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome to Your Popup Builder</h2>
                    <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                        Let's get your popup campaign builder set up in just a few simple steps. We'll help you configure everything you need to start creating engaging popups.
                    </p>
                </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-4">What we'll do:</h3>
                <ul className="space-y-3">
                    {['Verify your system requirements', 'Configure your website settings', 'Set up your admin account', 'Get you ready to create your first popup'].map((step, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">{index + 1}</div>
                            {step}
                        </li>
                    ))}
                </ul>
            </Card>

            <div className="flex justify-end pt-6">
                <Button onClick={onNext} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 transition-colors group">
                    Get Started
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
