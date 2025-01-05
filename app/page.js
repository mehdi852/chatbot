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
            <TrustedBy />

            {/* Key Features Section */}
            <section className="py-24 px-4 md:px-6 bg-background">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">{t('features.title')}</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">{t('features.mainHeading')}</h2>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">{t('features.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Settings,
                                color: 'primary',
                                title: t('features.items.management.title'),
                                description: t('features.items.management.description'),
                            },
                            {
                                icon: Puzzle,
                                color: 'primary',
                                title: t('features.items.types.title'),
                                description: t('features.items.types.description'),
                            },
                            {
                                icon: Target,
                                color: 'primary',
                                title: t('features.items.targeting.title'),
                                description: t('features.items.targeting.description'),
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className="group bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg transition-all duration-300">
                                <div className="mb-6">
                                    <div className="bg-primary/10 rounded-xl p-3 inline-block group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Advanced Features Section */}
            <section className="py-24 px-4 md:px-6 bg-gradient-to-b from-muted to-background">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">{t('advancedFeatures.title')}</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">{t('advancedFeatures.mainHeading')}</h2>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">{t('advancedFeatures.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Share2,
                                title: t('advancedFeatures.items.builder.title'),
                                description: t('advancedFeatures.items.builder.description'),
                                bgColor: 'card',
                            },
                            {
                                icon: Lightbulb,
                                title: t('advancedFeatures.items.analytics.title'),
                                description: t('advancedFeatures.items.analytics.description'),
                                bgColor: 'primary/5',
                            },
                            {
                                icon: MessageSquare,
                                title: t('advancedFeatures.items.timing.title'),
                                description: t('advancedFeatures.items.timing.description'),
                                bgColor: 'card',
                            },
                            {
                                icon: Puzzle,
                                title: t('advancedFeatures.items.integrations.title'),
                                description: t('advancedFeatures.items.integrations.description'),
                                bgColor: 'card',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className={`bg-${feature.bgColor} rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group border border-border`}>
                                <div className="mb-6">
                                    <div className="bg-primary/10 rounded-xl p-3 inline-block group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Product Demo Section */}
            <section className="py-24 px-4 md:px-6 bg-background overflow-hidden">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp} className="max-w-6xl mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 rounded-2xl transform -rotate-1"></div>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }} className="relative rounded-xl overflow-hidden shadow-2xl">
                        <Image src="/images/smallScreen.png" height={600} width={1000} alt="Popup Manager Interface" className="w-full object-cover" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">{t('testimonials.title')}</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">{t('testimonials.mainHeading')}</h2>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">{t('testimonials.description')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {t('testimonials.items', { returnObjects: true }).map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                variants={fadeInUp}
                                className="bg-card text-card-foreground p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
                                <div className="flex items-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary rounded-full transform -rotate-6"></div>
                                        <Image
                                            src={`/images/reviewsImages/rev${index + 1}.jpeg`}
                                            height={56}
                                            width={56}
                                            alt={testimonial.name}
                                            className="rounded-full relative border-2 border-background"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Statistics */}
            <section className="py-24 px-4 md:px-6 bg-gradient-to-r from-primary to-primary text-primary-foreground">
                <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {t('statistics.items', { returnObjects: true }).map((stat) => (
                            <motion.div
                                key={stat.number}
                                variants={fadeInUp}
                                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors duration-300">
                                <h3 className="text-4xl font-bold mb-2 text-primary-foreground">{stat.number}</h3>
                                <p className="text-sm text-primary-foreground/80">{stat.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <motion.section initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInUp} className="py-24 px-4 md:px-6 bg-background">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">{t('cta.heading')}</h2>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{t('cta.description')}</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                            {t('cta.button')}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            <Pricing />
        </div>
    );
}
