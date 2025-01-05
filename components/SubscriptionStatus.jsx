'use client';

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function SubscriptionStatus({ subscription }) {
    const { t } = useTranslation();
    const isExpiringSoon = subscription?.end_date && new Date(subscription.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isExpired = subscription?.end_date && new Date(subscription.end_date) < new Date();

    return (
        <div className="bg-card dark:bg-card/95 rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-foreground">{t('subscriptionStatus.title')}</h3>
                    <p className="text-sm text-muted-foreground">{subscription?.name || t('subscriptionStatus.freePlan')}</p>
                </div>
                {isExpired ? (
                    <XCircle className="text-red-500 dark:text-red-400" />
                ) : isExpiringSoon ? (
                    <AlertTriangle className="text-amber-500 dark:text-amber-400" />
                ) : (
                    <CheckCircle2 className="text-green-500 dark:text-green-400" />
                )}
            </div>

            {(isExpired || isExpiringSoon) && (
                <div
                    className={`text-sm p-3 rounded-md ${
                        isExpired ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                    {isExpired ? t('subscriptionStatus.messages.expired') : t('subscriptionStatus.messages.expiringSoon')}
                </div>
            )}

            <Button className="w-full" variant={isExpired ? 'destructive' : 'default'} onClick={() => (window.location.href = '/pricing')}>
                {isExpired ? t('subscriptionStatus.buttons.renew') : t('subscriptionStatus.buttons.upgrade')}
            </Button>
        </div>
    );
}
