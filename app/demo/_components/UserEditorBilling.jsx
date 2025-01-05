'use client';
import React, { useState, useEffect } from 'react';
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
        // Reset selected plan when switching to free
        if (!newStatus) {
            setSelectedPlan(null);
        }
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
                throw new Error('Failed to cancel subscription');
            }

            toast({
                title: 'Success',
                description: 'Subscription cancelled successfully',
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
        setSubscriptionSettings((prev) => ({ ...prev, subscription_ends_at: date }));
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/edit-user-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    subscriptionSettings: {
                        subscription: subscriptionSettings.subscription,
                        subscription_ends_at: subscriptionSettings.subscription_ends_at ? subscriptionSettings.subscription_ends_at.toISOString() : null,
                        stripeSubscriptionId: userSubscription?.id || 'dummy_subscription_id',
                        stripePriceId: selectedPlan,
                    },
                    planId: subscriptionSettings.planId,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            toast({
                title: 'Success',
                description: 'User billing updated successfully',
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
            <h1 className="text-2xl font-semibold mb-4">Billing Editor</h1>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="subscription">Subscription Status</Label>
                        <Select onValueChange={handleSubscriptionChange} value={subscriptionSettings.subscription.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder={subscriptionSettings.subscription ? 'Subscribed' : 'Free'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">Free</SelectItem>
                                <SelectItem value="true">Subscribed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {subscriptionSettings.subscription && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="plan">Subscription Plan</Label>
                                <Select onValueChange={handlePlanChange} value={selectedPlan}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan" />
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
                                <Label htmlFor="subscription_ends_at">Subscription End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !subscriptionSettings.subscription_ends_at && 'text-muted-foreground')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {subscriptionSettings.subscription_ends_at ? formatDate(subscriptionSettings.subscription_ends_at) : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={subscriptionSettings.subscription_ends_at} onSelect={handleDateChange} initialFocus />
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
                            <span className="ml-2">Saving...</span>
                        </>
                    ) : (
                        'Save changes'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default UserEditorBilling;
