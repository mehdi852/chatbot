import { SignUp } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
    return (
        <div className="min-h-screen bg-background/95 flex flex-col md:flex-row">
            {/* Left Section - Branding & Info */}
            <div className="w-full md:w-[45%] lg:w-[40%] relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image src="/images/signin.jpg" alt="Background" fill className="object-cover object-center brightness-[0.8]" priority quality={100} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                </div>

                {/* Back to Home */}
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-20">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to home</span>
                </Link>

                {/* Content */}
                <div className="relative h-full flex flex-col p-8 pt-32 md:p-12 md:pt-32 z-10">
                    <div>
                        {/* Logo */}
                        <div className="mb-12">
                            <Image src="/uploads/logo.png" alt="Logo" width={140} height={40} className="brightness-0 invert" />
                        </div>

                        {/* Main Content */}
                        <div className="space-y-8">
                            {/* Welcome Text */}
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                    Start Creating <br />
                                    <span className="text-primary">Today</span>
                                </h1>
                                <p className="text-white/80 text-lg max-w-md leading-relaxed">Join thousands of marketers who are boosting their conversion rates with smart popups.</p>
                            </div>

                            {/* Stats Section */}
                            <div className="grid grid-cols-2 gap-6 pt-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-white">40%</h3>
                                    <p className="text-white/70 text-sm">Higher Conversion</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-white">Smart</h3>
                                    <p className="text-white/70 text-sm">Targeting</p>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="pt-8 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <span className="text-primary text-sm">✓</span>
                                    </div>
                                    <p className="text-white/90">Real-time Analytics Dashboard</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <span className="text-primary text-sm">✓</span>
                                    </div>
                                    <p className="text-white/90">Advanced Targeting Options</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <span className="text-primary text-sm">✓</span>
                                    </div>
                                    <p className="text-white/90">Smart Popup Management</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-12">
                        <p className="text-sm text-white/60">© 2024 Popup Manager. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Section - Sign Up Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-muted/30 dark:bg-muted/10 backdrop-blur-sm">
                <div className="w-full max-w-[440px] mx-auto">
                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200',
                                card: 'shadow-xl bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/50 rounded-xl',
                                headerTitle: 'text-2xl font-bold text-foreground',
                                headerSubtitle: 'text-muted-foreground',
                                socialButtonsBlockButton: 'border border-border/50 hover:bg-muted/50 shadow-sm hover:shadow transition-all duration-200',
                                socialButtonsBlockButtonText: 'text-foreground font-medium',
                                formFieldLabel: 'text-foreground',
                                formFieldInput: 'bg-background/80 dark:bg-background/40 border-border/50 focus:ring-primary shadow-sm',
                                footerActionLink: 'text-primary hover:text-primary/90',
                                dividerLine: 'bg-border/50',
                                dividerText: 'text-muted-foreground',
                            },
                            layout: {
                                socialButtonsPlacement: 'top',
                                privacyPageUrl: '/privacy',
                                termsPageUrl: '/terms',
                            },
                        }}
                        routing="path"
                        signInUrl="/sign-in"
                    />
                </div>
            </div>
        </div>
    );
}
