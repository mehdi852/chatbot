import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Rocket, Palette, Users, MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FinishStep() {
    const router = useRouter();

    const handleGoToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-6">
                <div className="flex justify-center animate-bounce-slow">
                    <div className="rounded-full bg-green-100 p-4 shadow-lg shadow-green-100">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-gray-900">Installation Complete!</h2>
                    <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                        Congratulations! Your application has been successfully installed and configured. You're now ready to start creating amazing popup campaigns.
                    </p>
                </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-xl">
                <h3 className="font-semibold text-blue-900 text-xl mb-6">Next Steps:</h3>
                <div className="grid gap-4">
                    {[
                        { icon: Rocket, text: 'Log in to your admin dashboard to get started' },
                        { icon: Palette, text: 'Customize your website appearance and branding' },
                        { icon: MessageSquarePlus, text: 'Create your first engaging popup campaign' },
                        { icon: Users, text: 'Invite team members to collaborate' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-white/80 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200"
                            style={{ animationDelay: `${index * 150}ms` }}>
                            <div className="rounded-full bg-blue-100 p-2">
                                <item.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-blue-900">{item.text}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex justify-center pt-6">
                <Button size="lg" onClick={handleGoToDashboard} className="gap-2 bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-6 text-lg h-auto group">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
