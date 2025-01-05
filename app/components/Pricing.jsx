'use client';

import { Check } from 'lucide-react';
import { useSubscriptions } from '@/app/contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
    const { subscriptions, loading, error, billingCycle, setBillingCycle } = useSubscriptions();
    const { t } = useTranslation();


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

    // Handle error state
    if (error) {
        return (
            <div className="py-20 px-4 md:px-6 bg-background">
                <div className="max-w-7xl mx-auto text-center text-destructive">
                    {t('pricing.error')}: {error}
                </div>
            </div>
        );
    }

    // Handle empty subscriptions
    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="py-20 px-4 md:px-6 bg-background">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">{t('pricing.noPlans')}</div>
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
        <section className="py-20 px-4 md:px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-primary font-medium mb-4">{t('pricing.title')}</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('pricing.heading')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{t('pricing.description')}</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center space-x-4 mb-16">
                    <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{t('pricing.billing.monthly')}</span>
                    <button onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'annually' : 'monthly'))} className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition ${billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <div className="flex items-center">
                        <span className={`text-sm ${billingCycle === 'annually' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{t('pricing.billing.annual')}</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t('pricing.billing.save')}</span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {subscriptions.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-card rounded-2xl p-8 border ${plan.name.toLowerCase() === 'pro' ? 'border-primary/20 ring-1 ring-primary/20' : 'border-border'} flex flex-col`}>
                            {plan.name.toLowerCase() === 'pro' && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary w-fit mb-4">{t('pricing.mostPopular')}</span>
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
                                    <h4 className="text-sm font-medium text-foreground mb-2">{t('pricing.features')}</h4>
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
                                {plan.name.toLowerCase() === 'enterprise' ? t('pricing.buttons.contactSales') : t('pricing.buttons.getStarted')}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
