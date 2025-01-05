'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/Functions';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const UserEditorBilling = ({ user, getTotalUsers, onUpdateSuccess }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [subscriptionSettings, setSubscriptionSettings] = useState({
        subscription: user.subscription,
        subscription_ends_at: user.subscription_ends_at ? new Date(user.subscription_ends_at) : null,
        planId: null,
    });
    const [userSubscription, setUserSubscription] = useState(null);
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        // Fetch the user's subscription details
        const fetchUserSubscription = async () => {
            try {
                const response = await fetch(`/api/admin/get-user-subscription?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserSubscription(data.subscription);
                }
            } catch (error) {
                console.error('Error fetching user subscription:', error);
            }
        };

        // Fetch subscription types
        const fetchSubscriptionTypes = async () => {
            try {
                const response = await fetch('/api/admin/get-subscriptions-types');
                if (response.ok) {
                    const data = await response.json();
                    setSubscriptionTypes(data.subscriptions);
                }
            } catch (error) {
                console.error('Error fetching subscription types:', error);
            }
        };

        fetchUserSubscription();
        fetchSubscriptionTypes();
    }, [user.id]);

    // Handle subscription status change
    const handleSubscriptionChange = async (value) => {
        const newStatus = value === 'true';
        if (!newStatus && userSubscription) {
            // If changing to free and there's an active subscription, cancel it
            await cancelSubscription();
        }
        setSubscriptionSettings((prev) => ({
            ...prev,
            subscription: newStatus,
            subscription_ends_at: newStatus ? prev.subscription_ends_at : null,
        }));
    };

    // Function to cancel subscription
    const cancelSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/cancel-user-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    subscriptionId: userSubscription?.id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('adminPage.userEditor.billing.messages.cancelError'));
            }

            // reset the project
            await fetch('/api/user/reset-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            toast({
                title: 'Success',
                description: t('adminPage.userEditor.billing.messages.cancelSuccess'),
                variant: 'success',
            });

            // Update local state
            setUserSubscription(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle subscription end date change
    const handleDateChange = (date) => {
        setSubscriptionSettings((prev) => ({
            ...prev,
            subscription_ends_at: date || null,
        }));
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            // Only require plan selection if subscription is true
            if (subscriptionSettings.subscription && !selectedPlan) {
                toast({
                    title: 'Error',
                    description: t('adminPage.userEditor.billing.messages.selectPlanError'),
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/admin/edit-user-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    subscriptionSettings: {
                        subscription: subscriptionSettings.subscription,
                        subscription_ends_at: subscriptionSettings.subscription_ends_at ? new Date(subscriptionSettings.subscription_ends_at).toISOString() : null,
                        stripeSubscriptionId: userSubscription?.id || 'dummy_subscription_id',
                        stripePriceId: subscriptionSettings.subscription ? selectedPlan : null,
                    },
                    planId: subscriptionSettings.subscription ? subscriptionSettings.planId : null,
                }),
            });

            if (!response.ok) {
                throw new Error(t('adminPage.userEditor.billing.messages.updateError'));
            }

            toast({
                title: 'Success',
                description: t('adminPage.userEditor.billing.messages.updateSuccess'),
                variant: 'success',
            });
            getTotalUsers();
            onUpdateSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle plan change
    const handlePlanChange = (value) => {
        setSelectedPlan(value);
        setSubscriptionSettings((prev) => ({ ...prev, planId: value }));
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4 text-foreground">{t('adminPage.userEditor.billing.title')}</h1>
            <Card className="mt-4 bg-card">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">{t('adminPage.userEditor.billing.subscriptionDetails.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="subscription" className="text-foreground">
                            {t('adminPage.userEditor.billing.subscriptionDetails.status')}
                        </Label>
                        <Select onValueChange={handleSubscriptionChange} value={subscriptionSettings.subscription.toString()}>
                            <SelectTrigger className="bg-background">
                                <SelectValue
                                    placeholder={
                                        subscriptionSettings.subscription
                                            ? t('adminPage.userEditor.billing.subscriptionDetails.statuses.subscribed')
                                            : t('adminPage.userEditor.billing.subscriptionDetails.statuses.free')
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">{t('adminPage.userEditor.billing.subscriptionDetails.statuses.free')}</SelectItem>
                                <SelectItem value="true">{t('adminPage.userEditor.billing.subscriptionDetails.statuses.subscribed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {subscriptionSettings.subscription && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="plan" className="text-foreground">
                                    {t('adminPage.userEditor.billing.subscriptionDetails.plan')}
                                </Label>
                                <Select onValueChange={handlePlanChange} value={selectedPlan}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder={t('adminPage.userEditor.billing.subscriptionDetails.selectPlan')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subscriptionTypes.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.name} - ${plan.price}/month
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="subscription_ends_at" className="text-foreground">
                                    {t('adminPage.userEditor.billing.subscriptionDetails.endDate')}
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal bg-background', !subscriptionSettings.subscription_ends_at && 'text-muted-foreground')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {subscriptionSettings.subscription_ends_at ? (
                                                formatDate(subscriptionSettings.subscription_ends_at)
                                            ) : (
                                                <span>{t('adminPage.userEditor.billing.subscriptionDetails.pickDate')}</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-auto p-0 pointer-events-auto bg-card" sideOffset={5}>
                                        <div className="p-3">
                                            <Calendar mode="single" selected={new Date()} onSelect={handleDateChange} className="rounded-md border border-border" />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
                <Button onClick={handleFormSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="small" color="white" />
                            <span className="ml-2">{t('adminPage.userEditor.billing.buttons.saving')}</span>
                        </>
                    ) : (
                        t('adminPage.userEditor.billing.buttons.save')
                    )}
                </Button>
            </div>
        </div>
    );
};

export default UserEditorBilling;
