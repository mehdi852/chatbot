'use client';

import { Check } from 'lucide-react';
import { useSubscriptions } from '@/app/contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
    const { subscriptions, loading, error, billingCycle, setBillingCycle } = useSubscriptions();
    const { t } = useTranslation();

    // Translation helper with fallbacks
    const getTranslation = (key, fallback) => {
        try {
            const translation = t(key);
            return translation !== key ? translation : fallback;
        } catch {
            return fallback;
        }
    };

    // Handle loading state
    if (loading) {
        return (
            <div className="py-20 px-4 md:px-6 bg-background">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-8"></div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-muted rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error state (but subscriptions should have mock data as fallback)
    if (error && (!subscriptions || subscriptions.length === 0)) {
        return (
            <div className="py-20 px-4 md:px-6 bg-background">
                <div className="max-w-7xl mx-auto text-center text-destructive">
                    {getTranslation('pricing.error', 'Error loading pricing')}: {error}
                </div>
            </div>
        );
    }

    // This shouldn't happen now since we have mock data fallback
    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="py-20 px-4 md:px-6 bg-background">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">
                    {getTranslation('pricing.noPlans', 'No pricing plans available')}
                </div>
            </div>
        );
    }

    const getButtonStyle = (name) => {
        switch (name.toLowerCase()) {
            case 'pro':
                return 'bg-primary text-primary-foreground hover:bg-primary/90';
            case 'enterprise':
                return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
            default:
                return 'bg-muted text-foreground hover:bg-muted/90';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <section className="py-16 px-4 md:px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1.5 mb-4 border border-border/50">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{getTranslation('pricing.title', 'Pricing')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{getTranslation('pricing.heading', 'Choose Your Perfect Plan')}</h2>
                    <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">{getTranslation('pricing.description', 'Start free and scale as you grow. Cancel anytime.')}</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center space-x-4 mb-16">
                    <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{getTranslation('pricing.billing.monthly', 'Monthly')}</span>
                    <button onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'annually' : 'monthly'))} className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition ${billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <div className="flex items-center">
                        <span className={`text-sm ${billingCycle === 'annually' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{getTranslation('pricing.billing.annual', 'Annual')}</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{getTranslation('pricing.billing.save', 'Save 20%')}</span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {subscriptions.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-card rounded-2xl p-8 border ${plan.name.toLowerCase() === 'pro' ? 'border-primary/20 ring-1 ring-primary/20' : 'border-border'} flex flex-col`}>
                            {plan.name.toLowerCase() === 'pro' && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary w-fit mb-4">{getTranslation('pricing.mostPopular', 'Most Popular')}</span>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-foreground">{formatPrice(billingCycle === 'monthly' ? plan.price : plan.yearlyPrice)}</span>
                                    <span className="text-muted-foreground ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-foreground mb-2">{getTranslation('pricing.features', 'Features')}</h4>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center text-sm text-muted-foreground">
                                                <Check className="h-4 w-4 text-primary mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <a
                                href={billingCycle === 'monthly' ? plan.stripeMonthlyLink : plan.stripeYearlyLink}
                                className={`w-full py-3 px-4 rounded-md text-center font-medium transition-colors ${getButtonStyle(plan.name)}`}>
                                {plan.name.toLowerCase() === 'enterprise' ? getTranslation('pricing.buttons.contactSales', 'Contact Sales') : getTranslation('pricing.buttons.getStarted', 'Get Started')}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
