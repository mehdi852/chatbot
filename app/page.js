'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Pricing from './components/Pricing';
import { Share2, Puzzle, Settings, Lightbulb, Target, CheckSquare, MessageSquare, Play, X, ArrowRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function LandingPage() {
    const { t } = useTranslation();
    const [showGDPR, setShowGDPR] = useState(false);

    useEffect(() => {
        const hasConsent = localStorage.getItem('gdpr_consent');
        if (!hasConsent) {
            setShowGDPR(true);
        }
    }, []);

    const acceptGDPR = () => {
        localStorage.setItem('gdpr_consent', 'true');
        localStorage.setItem('gdpr_consent_date', new Date().toISOString());
        setShowGDPR(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* GDPR Consent */}
            <AnimatePresence>
                {showGDPR && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 p-4 md:p-6 dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1 pr-8">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                                    <span className="text-2xl">🔒</span> {t('gdpr.title')}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {t('gdpr.description')}{' '}
                                    <Link href="/privacy" className="text-primary hover:text-primary/90 underline">
                                        {t('gdpr.privacyLink')}
                                    </Link>
                                    .
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={acceptGDPR}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg">
                                    {t('gdpr.acceptAll')}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={acceptGDPR}
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                                    {t('gdpr.essentialOnly')}
                                </motion.button>
                            </div>
                            <button onClick={acceptGDPR} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground md:hidden">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Hero />
            {/* <TrustedBy /> */}

            {/* Key Features Section */}
            <section className="py-16 px-4 md:px-6 bg-background">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('features.title')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t('features.mainHeading')}</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">{t('features.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Settings,
                                title: t('features.items.management.title'),
                                description: t('features.items.management.description'),
                                preview: (
                                    <div className="space-y-3">
                                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-foreground">Dashboard Settings</span>
                                                <div className="w-8 h-4 bg-primary rounded-full relative">
                                                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-3 border border-secondary/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-foreground">Auto-responses</span>
                                                <div className="w-8 h-4 bg-secondary rounded-full relative">
                                                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-muted rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Notifications</span>
                                                <div className="w-8 h-4 bg-muted-foreground/20 rounded-full relative">
                                                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: Puzzle,
                                title: t('features.items.types.title'),
                                description: t('features.items.types.description'),
                                preview: (
                                    <div className="space-y-2">
                                        <div className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-500">
                                            <div className="text-xs font-medium text-blue-700">💬 Chat Widget</div>
                                            <div className="text-xs text-blue-600">Live support</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-2 border-l-4 border-green-500">
                                            <div className="text-xs font-medium text-green-700">📧 Email Capture</div>
                                            <div className="text-xs text-green-600">Lead generation</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-500">
                                            <div className="text-xs font-medium text-purple-700">🎯 Exit Intent</div>
                                            <div className="text-xs text-purple-600">Smart triggers</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-2 border-l-4 border-orange-500">
                                            <div className="text-xs font-medium text-orange-700">📋 Surveys</div>
                                            <div className="text-xs text-orange-600">Feedback forms</div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                icon: Target,
                                title: t('features.items.targeting.title'),
                                description: t('features.items.targeting.description'),
                                preview: (
                                    <div className="space-y-3">
                                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-4 h-4 bg-primary rounded-full"></div>
                                                <span className="text-xs font-medium text-foreground">New Visitors</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Show welcome popup</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-3 border border-secondary/20">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-4 h-4 bg-secondary rounded-full"></div>
                                                <span className="text-xs font-medium text-foreground">Cart Abandoners</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Discount offers</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-lg p-3 border border-orange-500/20">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                                                <span className="text-xs font-medium text-foreground">VIP Customers</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Exclusive content</div>
                                        </div>
                                    </div>
                                )
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className="group relative">
                                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary/10 rounded-lg p-2.5">
                                                <feature.icon className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>

                                    {/* Interactive Preview */}
                                    <div className="relative mt-4">
                                        <div className="bg-muted/30 rounded-md p-3 border border-border/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-muted-foreground">Preview</span>
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="min-h-[100px]">
                                                {feature.preview}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Advanced Features Section */}
            <section className="py-16 px-4 md:px-6 bg-muted/20">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-background/80 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('advancedFeatures.title')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t('advancedFeatures.mainHeading')}</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">{t('advancedFeatures.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Share2,
                                title: t('advancedFeatures.items.builder.title'),
                                description: t('advancedFeatures.items.builder.description'),
                                floatingPreview: (
                                    <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/30 transform rotate-12 hover:rotate-6 transition-transform duration-300">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <div className="w-16 h-2 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <div className="w-12 h-2 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                <div className="w-14 h-2 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                                gradientFrom: 'from-blue-500/20',
                                gradientTo: 'to-blue-500/10',
                                borderColor: 'border-blue-500/30'
                            },
                            {
                                icon: Lightbulb,
                                title: t('advancedFeatures.items.analytics.title'),
                                description: t('advancedFeatures.items.analytics.description'),
                                floatingPreview: (
                                    <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/30 transform -rotate-12 hover:rotate-6 transition-transform duration-300">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-green-600">📈 45%</span>
                                                <div className="w-8 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-blue-600">👥 1.2k</span>
                                                <div className="w-6 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-purple-600">⏱️ 2.5m</span>
                                                <div className="w-7 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                                gradientFrom: 'from-emerald-500/20',
                                gradientTo: 'to-emerald-500/10',
                                borderColor: 'border-emerald-500/30'
                            },
                            {
                                icon: MessageSquare,
                                title: t('advancedFeatures.items.timing.title'),
                                description: t('advancedFeatures.items.timing.description'),
                                floatingPreview: (
                                    <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/30 transform rotate-6 hover:-rotate-6 transition-transform duration-300">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-orange-600">Page Load</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                                                <span className="text-xs text-yellow-600">5s Delay</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                                                <span className="text-xs text-green-600">Exit Intent</span>
                                            </div>
                                        </div>
                                    </div>
                                ),
                                gradientFrom: 'from-orange-500/20',
                                gradientTo: 'to-orange-500/10',
                                borderColor: 'border-orange-500/30'
                            },
                            {
                                icon: Puzzle,
                                title: t('advancedFeatures.items.integrations.title'),
                                description: t('advancedFeatures.items.integrations.description'),
                                floatingPreview: (
                                    <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/30 transform -rotate-6 hover:rotate-12 transition-transform duration-300">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
                                                <span className="text-white text-xs">📧</span>
                                            </div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-700 rounded flex items-center justify-center">
                                                <span className="text-white text-xs">💬</span>
                                            </div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-700 rounded flex items-center justify-center">
                                                <span className="text-white text-xs">📊</span>
                                            </div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-700 rounded flex items-center justify-center">
                                                <span className="text-white text-xs">🔗</span>
                                            </div>
                                        </div>
                                    </div>
                                ),
                                gradientFrom: 'from-indigo-500/20',
                                gradientTo: 'to-indigo-500/10',
                                borderColor: 'border-indigo-500/30'
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className="group relative">
                                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    {/* Subtle floating preview */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {feature.floatingPreview}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-3">
                                            <div className="bg-primary/10 rounded-lg p-2.5">
                                                <feature.icon className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                        
                                        {/* Subtle indicator */}
                                        <div className="mt-3 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                                            <span className="text-xs text-primary font-medium">Interactive</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
            {/* Testimonials */}
            <section className="py-16 px-4 md:px-6 bg-muted/20">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-background/80 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('testimonials.title')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t('testimonials.mainHeading')}</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">{t('testimonials.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {t('testimonials.items', { returnObjects: true }).map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                variants={fadeInUp}
                                className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-all duration-300">
                                <div className="flex items-center mb-4">
                                    <div className="relative flex-shrink-0">
                                        <Image
                                            src={`/images/reviewsImages/rev${index + 1}.jpeg`}
                                            height={40}
                                            width={40}
                                            alt={testimonial.name}
                                            className="rounded-full border-2 border-border"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Statistics */}
            <section className="py-16 px-4 md:px-6 bg-background">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statistics</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Trusted by Thousands</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">Join the growing community of businesses that rely on our platform.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 text-center">
                        {t('statistics.items', { returnObjects: true }).map((stat, index) => (
                            <motion.div
                                key={stat.number}
                                variants={fadeInUp}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300">
                                <h3 className="text-3xl font-bold mb-2 text-foreground">{stat.number}</h3>
                                <p className="text-sm text-muted-foreground">{stat.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 md:px-6 bg-muted/20">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 bg-background/80 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Get Started</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t('cta.heading')}</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed mb-6">{t('cta.description')}</p>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                                {t('cta.button')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            <Pricing />
        </div>
    );
}
